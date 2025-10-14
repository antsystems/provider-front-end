"""
Firebase authentication routes
"""
from flask import Blueprint, request, jsonify
from firebase_admin import auth
from app.config.firebase_config import get_firestore

firebase_bp = Blueprint('firebase', __name__)

@firebase_bp.route('/verify-token', methods=['POST'])
def verify_firebase_token():
    """Verify Firebase ID token and return user profile"""
    try:
        data = request.get_json()
        # Accept both 'idToken' and 'id_token' for compatibility
        id_token = data.get('idToken') or data.get('id_token')
        
        if not id_token:
            return jsonify({
                'success': False,
                'error': 'ID token is required'
            }), 400
        
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get user from Firebase Auth
        user = auth.get_user(uid)
        
        # Get user data from Firestore
        db = get_firestore()
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found in Firestore'
            }), 404
        
        user_data = user_doc.to_dict()
        
        # Return user profile
        return jsonify({
            'success': True,
            'user': {
                'id': uid,
                'uid': uid,
                'email': user.email,
                'name': user_data.get('name') or user.display_name,
                'displayName': user.display_name,
                'role': user_data.get('role', 'hospital_user'),
                'roles': user_data.get('roles', [user_data.get('role', 'hospital_user')]),
                'status': user_data.get('status', 'active'),
                'emailVerified': user.email_verified,
                'phone': user_data.get('phone_number') or user.phone_number,
                'hospital_id': user_data.get('hospital_id'),
                'hospital_name': user_data.get('hospital_name'),
                'entity_assignments': user_data.get('entity_assignments', {})  # Include entity assignments
            }
        })
        
    except auth.InvalidIdTokenError:
        return jsonify({
            'success': False,
            'error': 'Invalid or expired token'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
