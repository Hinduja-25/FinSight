import jwt
from functools import wraps
from flask import request, jsonify, current_app
from app.models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) > 1:
                token = parts[1]
        
        if not token:
            token = request.args.get('token')
            
        if not token:
            return jsonify({'message': 'Access denied: Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Session expired or invalid user'}), 401
        except Exception as e:
            return jsonify({'message': 'Access denied: Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated
