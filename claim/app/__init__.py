"""
Hospital Claim Management System
A Flask application for hospital users to manage insurance claims.
"""

from flask import Flask
from flask_cors import CORS
from app.config.config import Config
from app.config.firebase_config import initialize_firebase

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize Firebase
    initialize_firebase()
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.claims import claims_bp
    from app.routes.resources import resources_bp
    from app.routes.firebase import firebase_bp
    from app.routes.inbox import inbox_bp
    from app.routes.drafts import drafts_bp
    from app.routes.checklist import checklist_bp
    from app.routes.documents import documents_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(claims_bp, url_prefix='/api/v1/claims')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(firebase_bp, url_prefix='/api/firebase')
    app.register_blueprint(inbox_bp, url_prefix='/api/v1/inbox')
    app.register_blueprint(drafts_bp, url_prefix='/api/v1/drafts')
    app.register_blueprint(checklist_bp, url_prefix='/api/v1/checklist')
    app.register_blueprint(documents_bp, url_prefix='/api/v1/documents')
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    return app
