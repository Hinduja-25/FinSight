import io
import pandas as pd
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file
from app import db
from app.models import Income, Expense
from app.utils.auth_helper import token_required

transaction_bp = Blueprint('transactions', __name__)

# --- 1. Income Management ---
@transaction_bp.route('/api/income', methods=['GET'])
@token_required
def get_incomes(current_user):
    timeframe = request.args.get('timeframe')
    max_amount = request.args.get('max_amount', type=float)

    query = Income.query.filter_by(user_id=current_user.id)

    if timeframe in ['weekly', 'monthly', 'yearly']:
        from datetime import datetime, timedelta
        today = datetime.utcnow().date()
        if timeframe == 'weekly':
            start_date = today - timedelta(days=7)
        elif timeframe == 'monthly':
            start_date = today - timedelta(days=30)
        elif timeframe == 'yearly':
            start_date = today - timedelta(days=365)
        query = query.filter(Income.date >= start_date)

    if max_amount is not None:
        query = query.filter(Income.amount <= max_amount)

    sort_order = request.args.get('sort_order')
    if sort_order == 'amount_asc':
        query = query.order_by(Income.amount.asc())
    elif sort_order == 'amount_desc':
        query = query.order_by(Income.amount.desc())
    elif sort_order == 'date_asc':
        query = query.order_by(Income.date.asc())
    elif sort_order == 'date_desc':
        query = query.order_by(Income.date.desc())

    incomes = query.all()

    result = [{
        'id': inc.id, 'amount': inc.amount, 'source': inc.source,
        'date': inc.date.strftime('%Y-%m-%d') if inc.date else None,
        'status': inc.status,
        'expected_date': inc.expected_date.strftime('%Y-%m-%d') if inc.expected_date else None,
        'description': inc.description
    } for inc in incomes]
    return jsonify(result)

@transaction_bp.route('/api/income', methods=['POST'])
@token_required
def add_income(current_user):
    data = request.json
    if not data or not data.get('amount') or not data.get('source'):
        return jsonify({'message': 'Amount and Source are required'}), 400
        
    try:
        new_income = Income(
            user_id=current_user.id,
            amount=float(data.get('amount')),
            source=data.get('source'),
            date=datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date(),
            status=data.get('status', 'received'),
            expected_date=datetime.strptime(data.get('expected_date'), '%Y-%m-%d').date() if data.get('expected_date') else None,
            description=data.get('description', '')
        )
        db.session.add(new_income)
        db.session.commit()
        return jsonify({"message": "Income added successfully", "id": new_income.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to add income", "error": str(e)}), 400

@transaction_bp.route('/api/income/<int:id>', methods=['PUT'])
@token_required
def update_income(current_user, id):
    income = Income.query.filter_by(id=id, user_id=current_user.id).first()
    if not income:
        return jsonify({"message": "Income entry not found"}), 404
    
    data = request.json
    try:
        if 'status' in data:
            income.status = data['status']
            if data['status'] == 'received':
                income.expected_date = None
        
        if 'amount' in data: income.amount = float(data['amount'])
        if 'source' in data: income.source = data['source']
        if 'description' in data: income.description = data['description']
        if 'date' in data and data['date']: income.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'expected_date' in data and data['expected_date']: income.expected_date = datetime.strptime(data['expected_date'], '%Y-%m-%d').date()

        db.session.commit()
        return jsonify({"message": "Income updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Update failed", "error": str(e)}), 500

@transaction_bp.route('/api/income/<int:id>', methods=['DELETE'])
@token_required
def delete_income(current_user, id):
    income = Income.query.filter_by(id=id, user_id=current_user.id).first()
    if not income:
        return jsonify({"message": "Income entry not found"}), 404
    try:
        db.session.delete(income)
        db.session.commit()
        return jsonify({"message": "Income record deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Internal failure", "error": str(e)}), 500

# --- 2. Expense Management ---
@transaction_bp.route('/api/expenses', methods=['GET'])
@token_required
def get_expenses(current_user):
    timeframe = request.args.get('timeframe')
    max_amount = request.args.get('max_amount', type=float)

    query = Expense.query.filter_by(user_id=current_user.id)

    if timeframe in ['weekly', 'monthly', 'yearly']:
        from datetime import datetime, timedelta
        today = datetime.utcnow().date()
        if timeframe == 'weekly':
            start_date = today - timedelta(days=7)
        elif timeframe == 'monthly':
            start_date = today - timedelta(days=30)
        elif timeframe == 'yearly':
            start_date = today - timedelta(days=365)
        query = query.filter(Expense.date >= start_date)

    if max_amount is not None:
        query = query.filter(Expense.amount <= max_amount)

    sort_order = request.args.get('sort_order')
    if sort_order == 'amount_asc':
        query = query.order_by(Expense.amount.asc())
    elif sort_order == 'amount_desc':
        query = query.order_by(Expense.amount.desc())
    elif sort_order == 'date_asc':
        query = query.order_by(Expense.date.asc())
    elif sort_order == 'date_desc':
        query = query.order_by(Expense.date.desc())

    expenses = query.all()

    result = [{
        'id': exp.id, 'amount': exp.amount, 'category': exp.category,
        'date': exp.date.strftime('%Y-%m-%d') if exp.date else None,
        'description': exp.description
    } for exp in expenses]
    return jsonify(result)

@transaction_bp.route('/api/expenses', methods=['POST'])
@token_required
def add_expense(current_user):
    data = request.json
    if not data or not data.get('amount') or not data.get('category'):
        return jsonify({'message': 'Amount and Category are required'}), 400
        
    try:
        new_expense = Expense(
            user_id=current_user.id,
            amount=float(data.get('amount')),
            category=data.get('category'),
            date=datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date(),
            description=data.get('description', '')
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({"message": "Expense added successfully", "id": new_expense.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to log expense", "error": str(e)}), 400

@transaction_bp.route('/api/expenses/<int:id>', methods=['DELETE'])
@token_required
def delete_expense(current_user, id):
    expense = Expense.query.filter_by(id=id, user_id=current_user.id).first()
    if not expense:
        return jsonify({"message": "Expense not found"}), 404
    try:
        db.session.delete(expense)
        db.session.commit()
        return jsonify({"message": "Expense deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Internal failure", "error": str(e)}), 500

@transaction_bp.route('/api/expenses/<int:id>', methods=['PUT'])
@token_required
def update_expense(current_user, id):
    expense = Expense.query.filter_by(id=id, user_id=current_user.id).first()
    if not expense:
        return jsonify({"message": "Expense not found"}), 404
        
    data = request.json
    try:
        if 'amount' in data: expense.amount = float(data['amount'])
        if 'category' in data: expense.category = data['category']
        if 'description' in data: expense.description = data['description']
        if 'date' in data and data['date']: expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify({"message": "Expense updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Update failed", "error": str(e)}), 400

# --- 3. Analytics & Export ---
@transaction_bp.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    received_income = sum(inc.amount for inc in Income.query.filter_by(user_id=current_user.id, status='received').all())
    pending_income = sum(inc.amount for inc in Income.query.filter_by(user_id=current_user.id, status='pending').all())
    total_expenses = sum(exp.amount for exp in Expense.query.filter_by(user_id=current_user.id).all())
    return jsonify({
        'total_received_income': received_income,
        'total_pending_income': pending_income,
        'total_expenses': total_expenses,
        'total_balance': received_income - total_expenses
    })

@transaction_bp.route('/api/export', methods=['GET'])
@token_required
def export_excel(current_user):
    incomes = Income.query.filter_by(user_id=current_user.id).all()
    expenses = Expense.query.filter_by(user_id=current_user.id).all()

    income_df = pd.DataFrame([{
        'Type': 'Income', 'Date': inc.date, 'Amount': inc.amount, 
        'Category/Source': inc.source, 'Status': inc.status, 'Description': inc.description} for inc in incomes])
        
    expense_df = pd.DataFrame([{
        'Type': 'Expense', 'Date': exp.date, 'Amount': exp.amount, 
        'Category/Source': exp.category, 'Status': 'cleared', 'Description': exp.description} for exp in expenses])
        
    df = pd.concat([income_df, expense_df], ignore_index=True)
    if df.empty:
        df = pd.DataFrame(columns=['Type', 'Date', 'Amount', 'Category/Source', 'Status', 'Description'])
        
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Transactions')
    output.seek(0)
    return send_file(output, download_name='transactions_report.xlsx', as_attachment=True)
