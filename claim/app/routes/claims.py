"""
Claims management routes for IP (Inpatient) claims submission
Role-based access: hospital_user, claim_processor, reconciler ONLY
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import require_claims_access
from firebase_admin import firestore
from datetime import datetime
import uuid

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/submit', methods=['POST'])
@require_claims_access
def submit_claim():
    """Submit a new IP claim form for patients"""
    try:
        data = request.get_json()
        db = get_firestore()
        
        # Validate required fields
        required_fields = [
            # Patient Details
            'patient_name', 'age', 'gender', 'id_card_type', 'beneficiary_type', 'relationship',
            # Payer Details
            'payer_patient_id', 'authorization_number', 'total_authorized_amount', 'payer_type', 'payer_name',
            # Provider Details
            'patient_registration_number', 'specialty', 'doctor', 'treatment_line', 'claim_type',
            'service_start_date', 'service_end_date', 'inpatient_number', 'admission_type',
            'hospitalization_type', 'ward_type', 'final_diagnosis', 'treatment_done',
            # Bill Details
            'bill_number', 'bill_date', 'total_bill_amount', 'claimed_amount'
        ]
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Conditional validation: Insurer Name is required ONLY for TPA payer type
        payer_type = data.get('payer_type', '')
        if payer_type == 'TPA' and not data.get('insurer_name'):
            return jsonify({
                'success': False,
                'error': 'Insurer Name is required when Payer Type is TPA'
            }), 400
        
        # Clear insurer_name if payer_type is NOT TPA (business rule enforcement)
        if payer_type != 'TPA':
            data['insurer_name'] = ''
        
        # Business Rule Validations and Calculations
        total_authorized_amount = float(data.get('total_authorized_amount') or 0)
        claimed_amount = float(data.get('claimed_amount') or 0)
        total_bill_amount = float(data.get('total_bill_amount') or 0)
        patient_discount_amount = float(data.get('patient_discount_amount') or 0)
        amount_paid_by_patient = float(data.get('amount_paid_by_patient') or 0)
        
        # Rule 1: Claimed Amount cannot exceed Total Authorized Amount
        if claimed_amount > total_authorized_amount:
            return jsonify({
                'success': False,
                'error': f'Claimed Amount (₹{claimed_amount}) cannot exceed Total Authorized Amount (₹{total_authorized_amount})'
            }), 400
        
        # Rule 2: Auto-calculate Total Patient Paid = Patient Discount + Amount Paid By Patient
        total_patient_paid_amount = patient_discount_amount + amount_paid_by_patient
        
        # Rule 3: Auto-calculate Amount Charged to Payer = Total Bill - Total Patient Paid
        amount_charged_to_payer = total_bill_amount - total_patient_paid_amount
        
        # Override the values in data with calculated values
        data['total_patient_paid_amount'] = str(total_patient_paid_amount)
        data['amount_charged_to_payer'] = str(amount_charged_to_payer)
        
        # Generate claim ID in format: CSHLSIP-YYYYMMDD-XXX
        today = datetime.now().strftime('%Y%m%d')
        prefix = f'CSHLSIP-{today}-'
        
        # Find the last claim ID for today to get the next sequence number
        try:
            claims_today = db.collection('claims').where('claim_id', '>=', prefix).where('claim_id', '<', f'CSHLSIP-{today}-9999').get()
            
            if claims_today:
                # Extract sequence numbers from today's claims
                sequence_numbers = []
                for claim in claims_today:
                    claim_id_str = claim.to_dict().get('claim_id', '')
                    if claim_id_str.startswith(prefix):
                        try:
                            seq_num = int(claim_id_str.replace(prefix, ''))
                            sequence_numbers.append(seq_num)
                        except ValueError:
                            continue
                
                # Get next sequence number
                next_seq = max(sequence_numbers) + 1 if sequence_numbers else 0
            else:
                next_seq = 0
            
            claim_id = f'{prefix}{next_seq}'
        except Exception as e:
            # Fallback to timestamp-based ID if query fails
            claim_id = f'{prefix}{int(datetime.now().timestamp())}'
        
        # Determine the source module (defaults to 'claims' if not specified)
        created_in_module = data.get('created_in_module', 'claims')
        
        # Set module visibility flags based on source
        # For claims module: show_in_claims=True by default, others=False
        # For preauth module: all False by default (will be updated when moved to claims)
        if created_in_module == 'claims':
            show_in_claims = data.get('show_in_claims', True)
            show_in_preauth = data.get('show_in_preauth', False)
            show_in_reimb = data.get('show_in_reimb', False)
        elif created_in_module == 'preauth':
            show_in_claims = data.get('show_in_claims', False)
            show_in_preauth = data.get('show_in_preauth', False)
            show_in_reimb = data.get('show_in_reimb', False)
        else:  # reimb or other
            show_in_claims = data.get('show_in_claims', False)
            show_in_preauth = data.get('show_in_preauth', False)
            show_in_reimb = data.get('show_in_reimb', False)
        
        # Prepare claim document
        claim_document = {
            # Claim Metadata
            'claim_id': claim_id,
            'claim_status': 'pending',
            'submission_date': firestore.SERVER_TIMESTAMP,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            
            # Module visibility flags
            'show_in_claims': show_in_claims,
            'show_in_preauth': show_in_preauth,
            'show_in_reimb': show_in_reimb,
            'created_in_module': created_in_module,
            
            # Patient Details
            'patient_details': {
                'patient_name': data.get('patient_name'),
                'age': int(data.get('age') or 0),
                'age_unit': data.get('age_unit', 'YRS'),
                'gender': data.get('gender'),
                'id_card_type': data.get('id_card_type'),
                'id_card_number': data.get('id_card_number', ''),
                'patient_contact_number': data.get('patient_contact_number', ''),
                'patient_email_id': data.get('patient_email_id', ''),
                'beneficiary_type': data.get('beneficiary_type'),
                'relationship': data.get('relationship')
            },
            
            # Payer Details
            'payer_details': {
                'payer_patient_id': data.get('payer_patient_id'),
                'authorization_number': data.get('authorization_number'),
                'total_authorized_amount': float(data.get('total_authorized_amount') or 0),
                'payer_type': data.get('payer_type'),
                'payer_name': data.get('payer_name'),
                'insurer_name': data.get('insurer_name'),
                'policy_number': data.get('policy_number', ''),
                'sponsorer_corporate_name': data.get('sponsorer_corporate_name'),
                'sponsorer_employee_id': data.get('sponsorer_employee_id', ''),
                'sponsorer_employee_name': data.get('sponsorer_employee_name', '')
            },
            
            # Provider Details
            'provider_details': {
                'patient_registration_number': data.get('patient_registration_number'),
                'specialty': data.get('specialty'),
                'doctor': data.get('doctor'),
                'treatment_line': data.get('treatment_line'),
                'claim_type': data.get('claim_type'),
                'service_start_date': data.get('service_start_date'),
                'service_end_date': data.get('service_end_date'),
                'inpatient_number': data.get('inpatient_number'),
                'admission_type': data.get('admission_type'),
                'hospitalization_type': data.get('hospitalization_type'),
                'ward_type': data.get('ward_type'),
                'final_diagnosis': data.get('final_diagnosis'),
                'icd_10_code': data.get('icd_10_code', ''),
                'treatment_done': data.get('treatment_done'),
                'pcs_code': data.get('pcs_code', '')
            },
            
            # Bill Details
            'bill_details': {
                'bill_number': data.get('bill_number'),
                'bill_date': data.get('bill_date'),
                'security_deposit': float(data.get('security_deposit') or 0),
                'total_bill_amount': float(data.get('total_bill_amount') or 0),
                'patient_discount_amount': float(data.get('patient_discount_amount') or 0),
                'amount_paid_by_patient': float(data.get('amount_paid_by_patient') or 0),
                'total_patient_paid_amount': float(data.get('total_patient_paid_amount') or 0),
                'amount_charged_to_payer': float(data.get('amount_charged_to_payer') or 0),
                'mou_discount_amount': float(data.get('mou_discount_amount') or 0),
                'claimed_amount': float(data.get('claimed_amount') or 0),
                'submission_remarks': data.get('submission_remarks', '')
            },
            
            # Additional metadata
            'hospital_id': data.get('hospital_id'),  # Required: Must be provided by client
            'submitted_by': data.get('submitted_by', ''),
            'submitted_by_email': data.get('submitted_by_email', ''),
            
            # Documents
            'documents': data.get('documents', [])
        }
        
        # Save to Firestore
        db.collection('claims').document(claim_id).set(claim_document)
        
        return jsonify({
            'success': True,
            'message': 'Claim submitted successfully',
            'claim_id': claim_id,
            'claim_status': 'pending',
            'submission_date': datetime.now().isoformat()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/move-to-claims/<claim_id>', methods=['PUT'])
@require_claims_access
def move_preauth_to_claims(claim_id):
    """Move a preauth claim to claims module by updating show_in_claims flag"""
    try:
        db = get_firestore()
        claim_ref = db.collection('claims').document(claim_id)
        claim_doc = claim_ref.get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        # Update the show_in_claims flag to True
        claim_ref.update({
            'show_in_claims': True,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'moved_to_claims_at': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': 'Claim moved to claims module successfully',
            'claim_id': claim_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/list', methods=['GET'])
@require_claims_access
def list_claims():
    """Get all claims or filter by parameters"""
    try:
        db = get_firestore()
        
        # Get query parameters
        hospital_id = request.args.get('hospital_id')
        claim_status = request.args.get('status')
        claim_type = request.args.get('claim_type')
        module_filter = request.args.get('module', 'claims')  # default to 'claims' module
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = db.collection('claims')
        
        # Filter by module visibility (important for module separation)
        if module_filter == 'claims':
            query = query.where('show_in_claims', '==', True)
        elif module_filter == 'preauth':
            query = query.where('show_in_preauth', '==', True)
        elif module_filter == 'reimb':
            query = query.where('show_in_reimb', '==', True)
        
        if hospital_id:
            query = query.where('hospital_id', '==', hospital_id)
        if claim_status:
            query = query.where('claim_status', '==', claim_status)
        if claim_type:
            query = query.where('provider_details.claim_type', '==', claim_type)
        
        # Execute query with limit
        claims = query.limit(limit).get()
        
        claims_list = []
        for doc in claims:
            claim_data = doc.to_dict()
            
            # Format dates for JSON serialization
            formatted_claim = claim_data.copy()
            if claim_data.get('submission_date'):
                formatted_claim['submission_date'] = str(claim_data['submission_date'])
            if claim_data.get('created_at'):
                formatted_claim['created_at'] = str(claim_data['created_at'])
            if claim_data.get('updated_at'):
                formatted_claim['updated_at'] = str(claim_data['updated_at'])
            
            claims_list.append(formatted_claim)
        
        return jsonify({
            'success': True,
            'total_claims': len(claims_list),
            'claims': claims_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/<claim_id>', methods=['GET'])
@require_claims_access
def get_claim(claim_id):
    """Get a specific claim by ID"""
    try:
        db = get_firestore()
        
        claim_doc = db.collection('claims').document(claim_id).get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        claim_data = claim_doc.to_dict()
        
        # Format dates for response
        if claim_data.get('submission_date'):
            claim_data['submission_date'] = str(claim_data['submission_date'])
        if claim_data.get('created_at'):
            claim_data['created_at'] = str(claim_data['created_at'])
        if claim_data.get('updated_at'):
            claim_data['updated_at'] = str(claim_data['updated_at'])
        
        return jsonify({
            'success': True,
            'claim': claim_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/<claim_id>', methods=['PUT'])
@require_claims_access
def update_claim(claim_id):
    """Update an existing claim"""
    try:
        db = get_firestore()
        data = request.get_json()
        
        claim_ref = db.collection('claims').document(claim_id)
        claim_doc = claim_ref.get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        # Prepare update data
        update_data = {
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        # Update patient details if provided
        if 'patient_details' in data:
            for key, value in data['patient_details'].items():
                update_data[f'patient_details.{key}'] = value
        
        # Update payer details if provided
        if 'payer_details' in data:
            for key, value in data['payer_details'].items():
                update_data[f'payer_details.{key}'] = value
        
        # Update provider details if provided
        if 'provider_details' in data:
            for key, value in data['provider_details'].items():
                update_data[f'provider_details.{key}'] = value
        
        # Update bill details if provided
        if 'bill_details' in data:
            for key, value in data['bill_details'].items():
                update_data[f'bill_details.{key}'] = value
        
        # Update claim status if provided
        if 'claim_status' in data:
            update_data['claim_status'] = data['claim_status']
        
        claim_ref.update(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Claim updated successfully',
            'claim_id': claim_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/<claim_id>/status', methods=['PATCH'])
@require_claims_access
def update_claim_status(claim_id):
    """Update claim status"""
    try:
        db = get_firestore()
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Status is required'
            }), 400
        
        claim_ref = db.collection('claims').document(claim_id)
        claim_doc = claim_ref.get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        # Valid statuses
        valid_statuses = ['submitted', 'under_review', 'approved', 'rejected', 'settled', 'pending']
        status = data['status']
        
        if status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Valid statuses: {", ".join(valid_statuses)}'
            }), 400
        
        claim_ref.update({
            'claim_status': status,
            'status_updated_at': firestore.SERVER_TIMESTAMP,
            'status_remarks': data.get('remarks', ''),
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'message': 'Claim status updated successfully',
            'claim_id': claim_id,
            'new_status': status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@claims_bp.route('/<claim_id>', methods=['DELETE'])
@require_claims_access
def delete_claim(claim_id):
    """Delete a claim"""
    try:
        db = get_firestore()
        
        claim_ref = db.collection('claims').document(claim_id)
        claim_doc = claim_ref.get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        claim_ref.delete()
        
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

@claims_bp.route('/statistics', methods=['GET'])
@require_claims_access
def get_claims_statistics():
    """Get claims statistics"""
    try:
        db = get_firestore()
        
        hospital_id = request.args.get('hospital_id')
        
        # Build query
        query = db.collection('claims')
        if hospital_id:
            query = query.where('hospital_id', '==', hospital_id)
        
        claims = query.get()
        
        # Calculate statistics
        total_claims = len(claims)
        total_claimed_amount = 0
        status_counts = {}
        claim_type_counts = {}
        
        for doc in claims:
            claim_data = doc.to_dict()
            
            # Sum claimed amounts
            claimed_amount = claim_data.get('bill_details', {}).get('claimed_amount', 0)
            total_claimed_amount += float(claimed_amount)
            
            # Count by status
            status = claim_data.get('claim_status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by claim type
            claim_type = claim_data.get('provider_details', {}).get('claim_type', 'unknown')
            claim_type_counts[claim_type] = claim_type_counts.get(claim_type, 0) + 1
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_claims': total_claims,
                'total_claimed_amount': total_claimed_amount,
                'claims_by_status': status_counts,
                'claims_by_type': claim_type_counts
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
