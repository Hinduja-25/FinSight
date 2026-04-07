import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'User already exists'}), 400
    
    try:
        hashed_password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
        new_user = User(username=data.get('username'), email=data.get('email'), password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Account creation failed', 'error': str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'message': 'Login failed. Check email or password'}), 401
    
    token = jwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)}, 
        current_app.config['SECRET_KEY'], 
        algorithm="HS256"
    )
    return jsonify({'token': token, 'username': user.username})
