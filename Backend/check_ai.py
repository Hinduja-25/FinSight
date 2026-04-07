import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    api_key = api_key.strip().strip("'").strip('"')

print(f"Key starts with: {api_key[:5] if api_key else 'None'}")

url = "https://api.openai.com/v1/chat/completions"
model = "gpt-3.5-turbo"

if api_key and api_key.startswith("gsk_"):
    url = "https://api.groq.com/openai/v1/chat/completions"
    model = "llama-3.1-8b-instant"

print(f"Using url: {url}")
print(f"Using model: {model}")

try:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello!"}],
        "max_tokens": 10
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=10)
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
