"""
User management routes for hospital users
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import require_hospital_auth

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@require_hospital_auth
def get_user_profile():
    """Get current user's profile information including name, role, and user ID"""
    try:
        uid = request.user['uid']
        db = get_firestore()
        
        # Get user document from Firestore
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            # If user document doesn't exist in Firestore, create basic profile from auth data
            user_info = {
                'uid': uid,
                'name': request.user.get('name', ''),
                'email': request.user.get('email', ''),
                'role': 'hospital_user'  # Default role
            }
        else:
            # Get user data from Firestore
            user_data = user_doc.to_dict()
            user_info = {
                'uid': uid,
                'name': user_data.get('displayName', request.user.get('name', '')),
                'email': user_data.get('email', request.user.get('email', '')),
                'role': user_data.get('role', 'hospital_user'),
                'hospital_code': user_data.get('hospitalCode', ''),
                'created_at': user_data.get('createdAt', ''),
                'preferences': user_data.get('preferences', {})
            }
        
        return jsonify({
            'success': True,
            'user': user_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/stats', methods=['GET'])
@require_hospital_auth
def get_user_stats():
    """Get user statistics"""
    try:
        uid = request.user['uid']
        db = get_firestore()
        
        # Get claims statistics
        claims_ref = db.collection('claims').where('hospitalId', '==', uid)
        claims = list(claims_ref.stream())
        
        total_amount = 0
        pending_count = 0
        approved_count = 0
        rejected_count = 0
        
        for claim in claims:
            claim_data = claim.to_dict()
            total_amount += claim_data.get('amount', 0)
            
            status = claim_data.get('status', 'pending')
            if status == 'pending':
                pending_count += 1
            elif status == 'approved':
                approved_count += 1
            elif status == 'rejected':
                rejected_count += 1
        
        stats = {
            'total_claims': len(claims),
            'total_amount': total_amount,
            'pending_claims': pending_count,
            'approved_claims': approved_count,
            'rejected_claims': rejected_count,
            'average_amount': total_amount / len(claims) if claims else 0
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/preferences', methods=['GET'])
@require_hospital_auth
def get_preferences():
    """Get user preferences"""
    try:
        uid = request.user['uid']
        db = get_firestore()
        
        user_doc = db.collection('users').document(uid).get()
        if not user_doc.exists:
            return jsonify({
                'notifications': True,
                'theme': 'light',
                'language': 'en'
            })
        
        user_data = user_doc.to_dict()
        return jsonify(user_data.get('preferences', {}))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/preferences', methods=['PUT'])
@require_hospital_auth
def update_preferences():
    """Update user preferences"""
    try:
        uid = request.user['uid']
        data = request.get_json()
        
        db = get_firestore()
        user_ref = db.collection('users').document(uid)
        
        update_data = {
            'preferences': data,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        user_ref.update(update_data)
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
