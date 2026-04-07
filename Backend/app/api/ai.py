import os
import json
import requests
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from app.models import Income, Expense
from app.utils.auth_helper import token_required

ai_bp = Blueprint('ai', __name__)

def clean_json(text):
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    return text.strip()

@ai_bp.route('/api/ai-periodic-analysis', methods=['GET'])
@token_required
def ai_periodic_analysis(current_user):
    today = datetime.utcnow().date()
    start_of_this_week = today - timedelta(days=today.weekday())
    start_of_last_week = start_of_this_week - timedelta(days=7)

    def get_weekly_totals(start_date, end_date):
        expenses = Expense.query.filter(
            Expense.user_id == current_user.id, 
            Expense.date >= start_date, 
            Expense.date < end_date
        ).all()
        totals = {}
        for e in expenses: 
            totals[e.category] = totals.get(e.category, 0) + e.amount
        return totals

    this_week = get_weekly_totals(start_of_this_week, today + timedelta(days=1))
    last_week = get_weekly_totals(start_of_last_week, start_of_this_week)
    
    this_total = sum(this_week.values())
    last_total = sum(last_week.values())
    
    if last_total > 0:
        total_change = ((this_total - last_total) / last_total * 100)
    else:
        total_change = 100.0 if this_total > 0 else 0.0

    categories = set(list(this_week.keys()) + list(last_week.keys()))
    cat_changes = []
    for cat in categories:
        tw, lw = this_week.get(cat, 0), last_week.get(cat, 0)
        percent = ((tw - lw) / lw * 100) if lw > 0 else 100.0 if tw > 0 else 0.0
        cat_changes.append({"category": cat, "change": percent})
    
    cat_changes.sort(key=lambda x: abs(x['change']), reverse=True)

    received_income = sum(inc.amount for inc in Income.query.filter_by(user_id=current_user.id, status='received').all())
    total_expenses = sum(exp.amount for exp in Expense.query.filter_by(user_id=current_user.id).all())

    # --- AI Integration ---
    api_key = os.getenv("OPENAI_API_KEY", "").strip().strip("'").strip('"')
    insight_cards = ["Monitor your trends closely.", "Keep setting budget goals.", "Consistency builds wealth."]
    personality = {"type": "Balanced", "description": "Steady as it goes! You're managing well."}

    if api_key:
        url = "https://api.groq.com/openai/v1/chat/completions" if api_key.startswith("gsk_") else "https://api.openai.com/v1/chat/completions"
        model = "llama-3.1-8b-instant" if api_key.startswith("gsk_") else "gpt-3.5-turbo"
        
        try:
            # 1. Personality
            p_resp = requests.post(url, headers={"Authorization": f"Bearer {api_key}"}, json={
                "model": model, "messages": [{"role": "system", "content": f"Income ₹{received_income}, Expenses ₹{total_expenses}. Classify: [Saver, Overspender, Balanced]. Return ONLY RAW JSON (no markdown): {{'type': '...', 'description': '...'}}"}], "max_tokens": 100
            }, timeout=10)
            if p_resp.status_code == 200:
                personality = json.loads(clean_json(p_resp.json()['choices'][0]['message']['content']))
            
            # 2. Tips
            t_resp = requests.post(url, headers={"Authorization": f"Bearer {api_key}"}, json={
                "model": model, "messages": [{"role": "system", "content": f"Trend: {total_change:.1f}%. Generate 3 ultra-short tips as a RAW JSON list of strings (no markdown)."}], "max_tokens": 150
            }, timeout=10)
            if t_resp.status_code == 200:
                insight_cards = json.loads(clean_json(t_resp.json()['choices'][0]['message']['content']))
        except Exception as e:
            current_app.logger.error(f"AI analysis fail: {str(e)}")

    return jsonify({
        "total_change": round(total_change, 1), 
        "categories": cat_changes[:4], 
        "cards": insight_cards[:3], 
        "personality": personality
    })

@ai_bp.route('/api/ai-insights', methods=['POST'])
@token_required
def ai_insights(current_user):
    data = request.json
    if not data or not data.get('messages'):
        return jsonify({'message': 'Query or chat history missing'}), 400
        
    inc_sum = sum(inc.amount for inc in Income.query.filter_by(user_id=current_user.id, status='received').all())
    exp_sum = sum(exp.amount for exp in Expense.query.filter_by(user_id=current_user.id).all())
    
    system_p = f"You are a professional financial AI. User Stats: Income ₹{inc_sum}, Spent ₹{exp_sum}. Be professional and brief."
    
    openai_messages = [{"role": "system", "content": system_p}]
    for msg in data.get('messages', [])[-5:]:
        openai_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    
    api_key = os.getenv("OPENAI_API_KEY", "").strip().strip("'").strip('"')
    if not api_key: 
        return jsonify({"message": "AI functionality unavailable (API check failed)"}), 503

    url = "https://api.groq.com/openai/v1/chat/completions" if api_key.startswith("gsk_") else "https://api.openai.com/v1/chat/completions"
    model = "llama-3.1-8b-instant" if api_key.startswith("gsk_") else "gpt-3.5-turbo"

    try:
        resp = requests.post(url, headers={"Authorization": f"Bearer {api_key}"}, json={
            "model": model, "messages": openai_messages, "max_tokens": 300
        }, timeout=15)
        if resp.status_code != 200:
            return jsonify({"message": "AI Provider Error"}), 502
        return jsonify({"insight": resp.json()['choices'][0]['message']['content']})
    except Exception as e:
        current_app.logger.error(f"AI chat fail: {str(e)}")
        return jsonify({"message": "AI service failure", "error": str(e)}), 500
