import os
import pytest
from app import create_app, db
from app.models import User

@pytest.fixture
def app():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SECRET_KEY": "test_secret"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    # Setup test user
    client.post('/api/signup', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Login test user
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    return response.json['token']
