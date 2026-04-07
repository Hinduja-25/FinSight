import pytest

# --- 1. Authentication Tests ---
def test_signup(client):
    response = client.post('/api/signup', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert b"User created successfully" in response.data

def test_login_invalid(client):
    response = client.post('/api/login', json={
        'email': 'nonexistent@example.com',
        'password': 'badpassword'
    })
    assert response.status_code == 401
    assert b"Login failed" in response.data

# --- 2. Transaction Tests ---
def test_add_income(client, auth_token):
    response = client.post('/api/income', 
        json={
            'amount': 5000,
            'source': 'Freelancing',
            'date': '2023-10-01',
            'status': 'received'
        },
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    assert response.status_code == 201
    assert b"Income added successfully" in response.data

def test_add_expense(client, auth_token):
    response = client.post('/api/expenses', 
        json={
            'amount': 1200,
            'category': 'Food',
            'date': '2023-10-02'
        },
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    assert response.status_code == 201
    assert b"Expense added successfully" in response.data

def test_analytics(client, auth_token):
    # Setup: add one income and one expense
    client.post('/api/income', 
        json={'amount': 1000, 'source': 'Test', 'status': 'received'},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    client.post('/api/expenses', 
        json={'amount': 200, 'category': 'Test'},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    # Check Analytics
    response = client.get('/api/analytics', headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200
    data = response.json
    assert data['total_received_income'] >= 1000
    assert data['total_expenses'] >= 200
    assert data['total_balance'] == data['total_received_income'] - data['total_expenses']

# --- 3. Authorization Tests ---
def test_protected_route_without_token(client):
    response = client.get('/api/analytics')
    assert response.status_code == 401
    assert b"Token is missing" in response.data
