"""
Draft management routes for saving and managing claim drafts
Role-based access: hospital_user, claim_processor, reconciler ONLY
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import require_claims_access
from firebase_admin import firestore
from datetime import datetime
import uuid

drafts_bp = Blueprint('drafts', __name__)

@drafts_bp.route('/save-draft-test', methods=['POST'])
def save_draft_test():
    """Test endpoint for saving draft without authentication"""
    try:
        data = request.get_json()
        db = get_firestore()
        
        # Validate minimum required field
        if not data.get('patient_name'):
            return jsonify({
                'success': False,
                'error': 'Patient name is required to save a draft'
            }), 400
        
        # Generate draft ID
        draft_id = f"draft_{uuid.uuid4().hex[:8]}"
        
        # Use test user info
        user_id = 'test_user'
        user_email = 'test@example.com'
        hospital_id = 'test_hospital'
        hospital_name = 'Test Hospital'
        
        # Prepare draft document
        draft_document = {
            # Draft Metadata
            'draft_id': draft_id,
            'claim_status': 'draft',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': user_id,
            'created_by_email': user_email,
            'hospital_id': hospital_id,
            'hospital_name': hospital_name,
            'is_draft': True,
            
            # Form data (all fields from request)
            'form_data': data,
            
            # Module visibility flags (default to claims module for drafts)
            'show_in_claims': True,
            'show_in_preauth': False,
            'show_in_reimb': False,
            'created_in_module': 'claims'
        }
        
        # Save to Firestore
        db.collection('claims').document(draft_id).set(draft_document)
        
        return jsonify({
            'success': True,
            'message': 'Draft saved successfully',
            'draft_id': draft_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/save-draft', methods=['POST'])
@require_claims_access
def save_draft():
    """Save a claim as draft with minimum required fields"""
    try:
        data = request.get_json()
        db = get_firestore()
        
        # Validate minimum required field
        if not data.get('patient_name'):
            return jsonify({
                'success': False,
                'error': 'Patient name is required to save a draft'
            }), 400
        
        # Generate draft ID
        draft_id = f"draft_{uuid.uuid4().hex[:8]}"
        
        # Get user info from request headers (set by auth middleware)
        user_id = request.headers.get('X-User-ID', '')
        user_email = request.headers.get('X-User-Email', '')
        hospital_id = request.headers.get('X-Hospital-ID', '')
        hospital_name = request.headers.get('X-Hospital-Name', '')
        
        # Prepare draft document
        draft_document = {
            # Draft Metadata
            'draft_id': draft_id,
            'claim_status': 'draft',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': user_id,
            'created_by_email': user_email,
            'hospital_id': hospital_id,
            'hospital_name': hospital_name,
            'is_draft': True,
            
            # Form data (all fields from request)
            'form_data': data,
            
            # Module visibility flags (default to claims module for drafts)
            'show_in_claims': True,
            'show_in_preauth': False,
            'show_in_reimb': False,
            'created_in_module': 'claims'
        }
        
        # Save to Firestore
        db.collection('claims').document(draft_id).set(draft_document)
        
        return jsonify({
            'success': True,
            'message': 'Draft saved successfully',
            'draft_id': draft_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/get-drafts-test', methods=['GET'])
def get_drafts_test():
    """Test endpoint for getting drafts without authentication"""
    try:
        db = get_firestore()
        
        # Use test hospital ID
        hospital_id = 'test_hospital'
        
        # Query drafts for this hospital
        query = db.collection('claims').where('hospital_id', '==', hospital_id).where('claim_status', '==', 'draft')
        drafts = query.get()
        
        drafts_list = []
        for doc in drafts:
            draft_data = doc.to_dict()
            
            # Format dates for JSON serialization
            formatted_draft = {
                'draft_id': draft_data.get('draft_id', doc.id),
                'status': draft_data.get('claim_status', 'draft'),
                'created_at': str(draft_data.get('created_at', '')),
                'updated_at': str(draft_data.get('updated_at', '')),
                'patient_name': draft_data.get('form_data', {}).get('patient_name', ''),
                'claimed_amount': draft_data.get('form_data', {}).get('claimed_amount', ''),
                'specialty': draft_data.get('form_data', {}).get('specialty', '')
            }
            drafts_list.append(formatted_draft)
        
        return jsonify({
            'success': True,
            'drafts': drafts_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/get-drafts', methods=['GET'])
@require_claims_access
def get_drafts():
    """Get all drafts for the user's hospital"""
    try:
        db = get_firestore()
        
        # Get user's hospital ID from headers
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'Hospital ID not found'
            }), 400
        
        # Query drafts for this hospital
        query = db.collection('claims').where('hospital_id', '==', hospital_id).where('claim_status', '==', 'draft')
        drafts = query.get()
        
        drafts_list = []
        for doc in drafts:
            draft_data = doc.to_dict()
            
            # Format dates for JSON serialization
            formatted_draft = {
                'draft_id': draft_data.get('draft_id', doc.id),
                'status': draft_data.get('claim_status', 'draft'),
                'created_at': str(draft_data.get('created_at', '')),
                'updated_at': str(draft_data.get('updated_at', '')),
                'patient_name': draft_data.get('form_data', {}).get('patient_name', ''),
                'claimed_amount': draft_data.get('form_data', {}).get('claimed_amount', ''),
                'specialty': draft_data.get('form_data', {}).get('specialty', '')
            }
            drafts_list.append(formatted_draft)
        
        return jsonify({
            'success': True,
            'drafts': drafts_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/get-draft/<draft_id>', methods=['GET'])
@require_claims_access
def get_draft(draft_id):
    """Get specific draft by ID"""
    try:
        db = get_firestore()
        
        # Get user's hospital ID from headers
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'Hospital ID not found'
            }), 400
        
        # Get draft document
        draft_doc = db.collection('claims').document(draft_id).get()
        
        if not draft_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Draft not found'
            }), 404
        
        draft_data = draft_doc.to_dict()
        
        # Check if draft belongs to user's hospital
        if draft_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Format response
        formatted_draft = {
            'draft_id': draft_data.get('draft_id', draft_id),
            'status': draft_data.get('claim_status', 'draft'),
            'created_at': str(draft_data.get('created_at', '')),
            'updated_at': str(draft_data.get('updated_at', '')),
            'created_by': draft_data.get('created_by', ''),
            'created_by_email': draft_data.get('created_by_email', ''),
            'hospital_id': draft_data.get('hospital_id', ''),
            'hospital_name': draft_data.get('hospital_name', ''),
            'form_data': draft_data.get('form_data', {}),
            'is_draft': draft_data.get('is_draft', True)
        }
        
        return jsonify({
            'success': True,
            'draft': formatted_draft
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/update-draft/<draft_id>', methods=['PUT'])
@require_claims_access
def update_draft(draft_id):
    """Update an existing draft"""
    try:
        data = request.get_json()
        db = get_firestore()
        
        # Get user's hospital ID from headers
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'Hospital ID not found'
            }), 400
        
        # Get draft document
        draft_ref = db.collection('claims').document(draft_id)
        draft_doc = draft_ref.get()
        
        if not draft_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Draft not found'
            }), 404
        
        draft_data = draft_doc.to_dict()
        
        # Check if draft belongs to user's hospital
        if draft_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Update form data
        current_form_data = draft_data.get('form_data', {})
        updated_form_data = {**current_form_data, **data}
        
        # Update document
        draft_ref.update({
            'form_data': updated_form_data,
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'message': 'Draft updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/submit-draft/<draft_id>', methods=['POST'])
@require_claims_access
def submit_draft(draft_id):
    """Submit a draft as a claim (changes status from draft to pending)"""
    try:
        db = get_firestore()
        
        # Get user's hospital ID from headers
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'Hospital ID not found'
            }), 400
        
        # Get draft document
        draft_ref = db.collection('claims').document(draft_id)
        draft_doc = draft_ref.get()
        
        if not draft_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Draft not found'
            }), 404
        
        draft_data = draft_doc.to_dict()
        
        # Check if draft belongs to user's hospital
        if draft_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Check if it's actually a draft
        if draft_data.get('claim_status') != 'draft':
            return jsonify({
                'success': False,
                'error': 'This is not a draft'
            }), 400
        
        # Get form data
        form_data = draft_data.get('form_data', {})
        
        # Validate required fields for submission
        required_fields = [
            'patient_name', 'age', 'gender', 'id_card_type', 'beneficiary_type', 'relationship',
            'payer_patient_id', 'authorization_number', 'total_authorized_amount', 'payer_type', 'payer_name',
            'patient_registration_number', 'specialty', 'doctor', 'treatment_line', 'claim_type',
            'service_start_date', 'service_end_date', 'inpatient_number', 'admission_type',
            'hospitalization_type', 'ward_type', 'final_diagnosis', 'treatment_done',
            'bill_number', 'bill_date', 'total_bill_amount', 'claimed_amount'
        ]
        
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields to submit: {", ".join(missing_fields)}'
            }), 400
        
        # Generate new claim ID for submission
        claim_id = f"claim_{uuid.uuid4().hex[:8]}"
        
        # Prepare claim document (similar to claims/submit)
        claim_document = {
            # Claim Metadata
            'claim_id': claim_id,
            'claim_status': 'pending',  # ✅ FIXED: Set to pending, not submitted
            'submission_date': firestore.SERVER_TIMESTAMP,
            'created_at': draft_data.get('created_at'),
            'updated_at': firestore.SERVER_TIMESTAMP,
            
            # Module visibility flags
            'show_in_claims': draft_data.get('show_in_claims', True),
            'show_in_preauth': draft_data.get('show_in_preauth', False),
            'show_in_reimb': draft_data.get('show_in_reimb', False),
            'created_in_module': draft_data.get('created_in_module', 'claims'),
            
            # Patient Details
            'patient_details': {
                'patient_name': form_data.get('patient_name'),
                'age': int(form_data.get('age') or 0),
                'age_unit': form_data.get('age_unit', 'YRS'),
                'gender': form_data.get('gender'),
                'id_card_type': form_data.get('id_card_type'),
                'id_card_number': form_data.get('id_card_number', ''),
                'patient_contact_number': form_data.get('patient_contact_number', ''),
                'patient_email_id': form_data.get('patient_email_id', ''),
                'beneficiary_type': form_data.get('beneficiary_type'),
                'relationship': form_data.get('relationship')
            },
            
            # Payer Details
            'payer_details': {
                'payer_patient_id': form_data.get('payer_patient_id'),
                'authorization_number': form_data.get('authorization_number'),
                'total_authorized_amount': float(form_data.get('total_authorized_amount') or 0),
                'payer_type': form_data.get('payer_type'),
                'payer_name': form_data.get('payer_name'),
                'insurer_name': form_data.get('insurer_name', ''),
                'policy_number': form_data.get('policy_number', ''),
                'sponsorer_corporate_name': form_data.get('sponsorer_corporate_name', ''),
                'sponsorer_employee_id': form_data.get('sponsorer_employee_id', ''),
                'sponsorer_employee_name': form_data.get('sponsorer_employee_name', '')
            },
            
            # Provider Details
            'provider_details': {
                'patient_registration_number': form_data.get('patient_registration_number'),
                'specialty': form_data.get('specialty'),
                'doctor': form_data.get('doctor'),
                'treatment_line': form_data.get('treatment_line'),
                'claim_type': form_data.get('claim_type'),
                'service_start_date': form_data.get('service_start_date'),
                'service_end_date': form_data.get('service_end_date'),
                'inpatient_number': form_data.get('inpatient_number'),
                'admission_type': form_data.get('admission_type'),
                'hospitalization_type': form_data.get('hospitalization_type'),
                'ward_type': form_data.get('ward_type'),
                'final_diagnosis': form_data.get('final_diagnosis'),
                'treatment_done': form_data.get('treatment_done'),
                'icd_10_code': form_data.get('icd_10_code', ''),
                'pcs_code': form_data.get('pcs_code', '')
            },
            
            # Bill Details
            'bill_details': {
                'bill_number': form_data.get('bill_number'),
                'bill_date': form_data.get('bill_date'),
                'security_deposit': float(form_data.get('security_deposit') or 0),
                'total_bill_amount': float(form_data.get('total_bill_amount') or 0),
                'patient_discount_amount': float(form_data.get('patient_discount_amount') or 0),
                'amount_paid_by_patient': float(form_data.get('amount_paid_by_patient') or 0),
                'total_patient_paid_amount': float(form_data.get('total_patient_paid_amount') or 0),
                'amount_charged_to_payer': float(form_data.get('amount_charged_to_payer') or 0),
                'mou_discount_amount': float(form_data.get('mou_discount_amount') or 0),
                'claimed_amount': float(form_data.get('claimed_amount') or 0),
                'submission_remarks': form_data.get('submission_remarks', '')
            },
            
            # Additional metadata
            'hospital_id': draft_data.get('hospital_id'),
            'submitted_by': draft_data.get('created_by', ''),
            'submitted_by_email': draft_data.get('created_by_email', '')
        }
        
        # Save new claim document
        db.collection('claims').document(claim_id).set(claim_document)
        
        # Delete the original draft
        draft_ref.delete()
        
        return jsonify({
            'success': True,
            'message': 'Draft submitted successfully',
            'claim_id': claim_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@drafts_bp.route('/delete-draft/<draft_id>', methods=['DELETE'])
@require_claims_access
def delete_draft(draft_id):
    """Delete a draft"""
    try:
        db = get_firestore()
        
        # Get user's hospital ID from headers
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        if not hospital_id:
            return jsonify({
                'success': False,
                'error': 'Hospital ID not found'
            }), 400
        
        # Get draft document
        draft_ref = db.collection('claims').document(draft_id)
        draft_doc = draft_ref.get()
        
        if not draft_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Draft not found'
            }), 404
        
        draft_data = draft_doc.to_dict()
        
        # Check if draft belongs to user's hospital
        if draft_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Check if it's actually a draft
        if draft_data.get('claim_status') != 'draft':
            return jsonify({
                'success': False,
                'error': 'This is not a draft'
            }), 400
        
        # Delete the draft
        draft_ref.delete()
        
        return jsonify({
            'success': True,
            'message': 'Draft deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
