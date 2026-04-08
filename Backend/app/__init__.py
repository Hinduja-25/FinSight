import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

db = SQLAlchemy()

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    CORS(app)
    
    # 1. Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///expense_db.sqlite')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')

    # 2. Initialization
    db.init_app(app)

    @app.errorhandler(Exception)
    def handle_exception(e):
        # Log the error for Observability
        app.logger.error(f"Err: {str(e)}")
        # Return generic JSON for Interface Safety
        code = 500
        if hasattr(e, 'code'): code = e.code
        return jsonify({"message": str(e), "status": "error"}), code

    with app.app_context():
        # 3. Register Blueprints
        from app.api.auth import auth_bp
        from app.api.transactions import transaction_bp
        from app.api.ai import ai_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(transaction_bp)
        app.register_blueprint(ai_bp)

        # 4. Create Tables (Initial development fallback)
        from app import models
        db.create_all()

    return app
