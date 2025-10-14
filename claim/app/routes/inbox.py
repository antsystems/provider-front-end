"""
Claims Inbox routes - Dedicated endpoints for inbox functionality
Role-based access: hospital_user, claim_processor, reconciler ONLY
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import require_claims_access
from firebase_admin import firestore
from datetime import datetime

inbox_bp = Blueprint('inbox', __name__)

@inbox_bp.route('/claims', methods=['GET'])
@require_claims_access
def get_inbox_claims():
    """Get claims for inbox view with filtering and pagination"""
    try:
        db = get_firestore()
        
        # Get query parameters
        hospital_id = request.args.get('hospital_id')
        status_filter = request.args.get('status', '')
        type_filter = request.args.get('claim_type', '')
        search_term = request.args.get('search', '')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query
        query = db.collection('claims')
        
        # Filter by hospital
        if hospital_id:
            query = query.where('hospital_id', '==', hospital_id)
        
        # Filter by status
        if status_filter:
            query = query.where('claim_status', '==', status_filter)
        
        # Filter by claim type
        if type_filter:
            query = query.where('provider_details.claim_type', '==', type_filter)
        
        # Only show claims in inbox (claims module)
        query = query.where('show_in_claims', '==', True)
        
        # Execute query with limit and offset
        claims = query.limit(limit).offset(offset).get()
        
        claims_list = []
        for doc in claims:
            claim_data = doc.to_dict()
            
            # Apply search filter if provided
            if search_term:
                search_lower = search_term.lower()
                patient_name = claim_data.get('patient_details', {}).get('patient_name', '').lower()
                claim_id = doc.id.lower()
                
                # Skip if doesn't match search
                if search_lower not in patient_name and search_lower not in claim_id:
                    continue
            
            # Format for inbox display
            inbox_claim = {
                'claim_id': doc.id,
                'patient_name': claim_data.get('patient_details', {}).get('patient_name', 'N/A'),
                'claim_status': claim_data.get('claim_status', 'pending'),
                'claim_type': claim_data.get('provider_details', {}).get('claim_type', 'N/A'),
                'submission_date': str(claim_data.get('submission_date', '')),
                'total_amount': claim_data.get('bill_details', {}).get('total_bill_amount', 0),
                'claimed_amount': claim_data.get('bill_details', {}).get('claimed_amount', 0),
                'hospital_id': claim_data.get('hospital_id'),
                'created_at': str(claim_data.get('created_at', '')),
                'updated_at': str(claim_data.get('updated_at', ''))
            }
            
            claims_list.append(inbox_claim)
        
        # Sort by submission date (newest first)
        claims_list.sort(key=lambda x: x.get('submission_date', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'claims': claims_list,
            'total': len(claims_list),
            'limit': limit,
            'offset': offset,
            'filters': {
                'hospital_id': hospital_id,
                'status': status_filter,
                'claim_type': type_filter,
                'search': search_term
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@inbox_bp.route('/claims/<claim_id>', methods=['GET'])
@require_claims_access
def get_inbox_claim_details(claim_id):
    """Get detailed information for a specific claim in inbox"""
    try:
        db = get_firestore()
        
        # Get claim document
        claim_doc = db.collection('claims').document(claim_id).get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        claim_data = claim_doc.to_dict()
        
        # Format for inbox details view
        inbox_details = {
            'claim_id': claim_id,
            'patient_details': claim_data.get('patient_details', {}),
            'payer_details': claim_data.get('payer_details', {}),
            'provider_details': claim_data.get('provider_details', {}),
            'bill_details': claim_data.get('bill_details', {}),
            'claim_status': claim_data.get('claim_status', 'pending'),
            'submission_date': str(claim_data.get('submission_date', '')),
            'created_at': str(claim_data.get('created_at', '')),
            'updated_at': str(claim_data.get('updated_at', ''))
        }
        
        return jsonify({
            'success': True,
            'claim': inbox_details
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@inbox_bp.route('/claims/<claim_id>/status', methods=['PUT'])
@require_claims_access
def update_inbox_claim_status(claim_id):
    """Update claim status from inbox"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': 'Status is required'
            }), 400
        
        # Valid statuses for inbox
        valid_statuses = ['pending', 'under_review', 'approved', 'rejected', 'on_hold']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }), 400
        
        db = get_firestore()
        
        # Update claim status
        update_data = {
            'claim_status': new_status,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        db.collection('claims').document(claim_id).update(update_data)
        
        return jsonify({
            'success': True,
            'message': f'Claim status updated to {new_status}',
            'claim_id': claim_id,
            'new_status': new_status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@inbox_bp.route('/claims/<claim_id>', methods=['DELETE'])
@require_claims_access
def delete_inbox_claim(claim_id):
    """Delete claim from inbox"""
    try:
        db = get_firestore()
        
        # Check if claim exists
        claim_doc = db.collection('claims').document(claim_id).get()
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        # Delete claim
        db.collection('claims').document(claim_id).delete()
        
        return jsonify({
            'success': True,
            'message': 'Claim deleted successfully',
            'claim_id': claim_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@inbox_bp.route('/stats', methods=['GET'])
@require_claims_access
def get_inbox_stats():
    """Get inbox statistics for dashboard"""
    try:
        db = get_firestore()
        hospital_id = request.args.get('hospital_id')
        
        # Build base query
        query = db.collection('claims').where('show_in_claims', '==', True)
        
        if hospital_id:
            query = query.where('hospital_id', '==', hospital_id)
        
        # Get all claims for stats
        claims = query.get()
        
        # Calculate statistics
        total_claims = len(claims)
        status_counts = {}
        type_counts = {}
        total_amount = 0
        
        for doc in claims:
            claim_data = doc.to_dict()
            
            # Status counts
            status = claim_data.get('claim_status', 'pending')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Type counts
            claim_type = claim_data.get('provider_details', {}).get('claim_type', 'Unknown')
            type_counts[claim_type] = type_counts.get(claim_type, 0) + 1
            
            # Total amount
            amount = claim_data.get('bill_details', {}).get('total_bill_amount', 0)
            if isinstance(amount, (int, float)):
                total_amount += amount
        
        return jsonify({
            'success': True,
            'stats': {
                'total_claims': total_claims,
                'status_breakdown': status_counts,
                'type_breakdown': type_counts,
                'total_amount': total_amount,
                'hospital_id': hospital_id
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
