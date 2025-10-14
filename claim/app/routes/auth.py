"""
Authentication routes for hospital users - SIMPLIFIED
"""
from flask import Blueprint, request, jsonify
from firebase_admin import auth
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import ALLOWED_CLAIMS_ROLES, BLOCKED_ROLES

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint - authenticate existing hospital user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user exists in Firebase Auth
        user = auth.get_user_by_email(email)
        
        # Check if user exists in Firestore
        db = get_firestore()
        user_doc = db.collection('users').document(user.uid).get()
        
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user_doc.to_dict()
        user_role = user_data.get('role', '').lower()
        
        # Check if role is blocked
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
                'message': f'Your role ({user_role}) is not authorized',
                'allowed_roles': ALLOWED_CLAIMS_ROLES
            }), 403
        
        # Generate custom token for the user
        custom_token = auth.create_custom_token(user.uid)
        token = custom_token.decode('utf-8')
        
        # Return user data with token
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'uid': user.uid,
                'email': user.email,
                'displayName': user_data.get('displayName', ''),
                'role': user_data.get('role'),
                'hospital_id': user_data.get('hospital_id', ''),
                'hospital_name': user_data.get('hospital_name', ''),
                'entity_assignments': {
                    'hospitals': [
                        {
                            'id': user_data.get('hospital_id', ''),
                            'name': user_data.get('hospital_name', '')
                        }
                    ]
                }
            },
            'token': token,
            'expires_in': 3600
        })
        
    except auth.UserNotFoundError:
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500