"""
Authentication middleware for hospital users with role-based access control
"""
from functools import wraps
from flask import request, jsonify
from firebase_admin import auth
from app.config.firebase_config import get_firestore

# Allowed roles for claims module
ALLOWED_CLAIMS_ROLES = [
    'hospital_user',
    'claim_processor',
    'reconciler'
]

# Blocked roles (NO ACCESS to Claims Module)
BLOCKED_ROLES = [
    'admin',
    'super_admin',
    'system_admin',
    'hospital_admin',
    'rm',
    'rp',
    'employee'
]

def require_claims_access(f):
    """Decorator for claims module - allows hospital_user, claim_processor, reconciler ONLY"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Get user data from Firestore
            db = get_firestore()
            user_doc = db.collection('users').document(uid).get()
            if not user_doc.exists:
                return jsonify({'error': 'User not found'}), 404
            
            user_data = user_doc.to_dict()
            user_role = user_data.get('role', '').lower()
            
            # Check if role is blocked (Admin roles are NOT allowed)
            if user_role in BLOCKED_ROLES:
                return jsonify({
                    'error': 'Access denied',
                    'message': 'Administrators cannot access the claims module',
                    'allowed_roles': ALLOWED_CLAIMS_ROLES
                }), 403
            
            # Check if role is allowed
            if user_role not in ALLOWED_CLAIMS_ROLES:
                return jsonify({
                    'error': 'Access denied',
                    'message': f'Your role ({user_role}) is not authorized to access claims',
                    'allowed_roles': ALLOWED_CLAIMS_ROLES
                }), 403
            
            # Store user info in request
            request.user = decoded_token
            request.user_data = user_data
            request.user_role = user_role
            
            # Set headers for draft routes
            request.headers['X-User-ID'] = uid
            request.headers['X-User-Email'] = user_data.get('email', '')
            request.headers['X-Hospital-ID'] = user_data.get('hospital_id', '')
            request.headers['X-Hospital-Name'] = user_data.get('hospital_name', '')
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function

def require_hospital_auth(f):
    """Decorator for hospital users only (legacy - kept for backward compatibility)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Check if user is a hospital user
            db = get_firestore()
            user_doc = db.collection('users').document(uid).get()
            if not user_doc.exists:
                return jsonify({'error': 'User not found'}), 404
            
            user_data = user_doc.to_dict()
            if user_data.get('role') not in ['hospital', 'hospital_user']:
                return jsonify({'error': 'Access denied. Hospital users only.'}), 403
            
            request.user = decoded_token
            request.user_data = user_data
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function

def require_auth(f):
    """General authentication decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function
