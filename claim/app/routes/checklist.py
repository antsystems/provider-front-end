"""
Checklist management routes for document requirements
Role-based access: hospital_user, claim_processor, reconciler ONLY
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore
from app.middleware.auth_middleware import require_claims_access
from firebase_admin import firestore
from datetime import datetime

checklist_bp = Blueprint('checklist', __name__)

@checklist_bp.route('/get-checklist-test', methods=['GET'])
def get_checklist_test():
    """Test endpoint for checklist without authentication"""
    try:
        payer_name = request.args.get('payer_name')
        specialty = request.args.get('specialty')
        
        if not payer_name or not specialty:
            return jsonify({
                'success': False,
                'error': 'Both payer_name and specialty are required'
            }), 400
        
        db = get_firestore()
        
        # Query checklist collection
        query = db.collection('document_checklist').where('payer_name', '==', payer_name).where('specialty', '==', specialty)
        docs = query.get()
        
        if not docs:
            # Try to find a general checklist for the payer (without specialty filter)
            general_query = db.collection('document_checklist').where('payer_name', '==', payer_name).where('specialty', '==', 'GENERAL')
            general_docs = general_query.get()
            
            if not general_docs:
                # Return default checklist if no specific or general checklist found
                return jsonify({
                    'success': True,
                    'checklist': get_default_checklist(),
                    'payer_name': payer_name,
                    'specialty': specialty,
                    'is_default': True
                }), 200
            
            docs = general_docs
        
        # Get the first matching checklist
        checklist_doc = docs[0]
        checklist_data = checklist_doc.to_dict()
        
        return jsonify({
            'success': True,
            'checklist': checklist_data.get('documents', []),
            'payer_name': payer_name,
            'specialty': specialty,
            'is_default': False
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@checklist_bp.route('/get-checklist', methods=['GET'])
@require_claims_access
def get_checklist():
    """Get document checklist based on payer_name and specialty"""
    try:
        payer_name = request.args.get('payer_name')
        specialty = request.args.get('specialty')
        
        if not payer_name or not specialty:
            return jsonify({
                'success': False,
                'error': 'Both payer_name and specialty are required'
            }), 400
        
        db = get_firestore()
        
        # Query checklist collection
        query = db.collection('document_checklist').where('payer_name', '==', payer_name).where('specialty', '==', specialty)
        docs = query.get()
        
        if not docs:
            # Try to find a general checklist for the payer (without specialty filter)
            general_query = db.collection('document_checklist').where('payer_name', '==', payer_name).where('specialty', '==', 'GENERAL')
            general_docs = general_query.get()
            
            if not general_docs:
                # Return default checklist if no specific or general checklist found
                return jsonify({
                    'success': True,
                    'checklist': get_default_checklist(),
                    'payer_name': payer_name,
                    'specialty': specialty,
                    'is_default': True
                }), 200
            
            docs = general_docs
        
        # Get the first matching checklist
        checklist_doc = docs[0]
        checklist_data = checklist_doc.to_dict()
        
        return jsonify({
            'success': True,
            'checklist': checklist_data.get('documents', []),
            'payer_name': payer_name,
            'specialty': specialty,
            'is_default': False
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@checklist_bp.route('/create-checklist', methods=['POST'])
@require_claims_access
def create_checklist():
    """Create or update a document checklist (Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['payer_name', 'specialty', 'documents']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        db = get_firestore()
        
        # Create checklist document
        checklist_document = {
            'payer_name': data.get('payer_name'),
            'specialty': data.get('specialty'),
            'documents': data.get('documents'),
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': request.headers.get('X-User-ID', ''),
            'created_by_email': request.headers.get('X-User-Email', '')
        }
        
        # Use payer_name + specialty as document ID
        doc_id = f"{data.get('payer_name')}_{data.get('specialty')}".replace(' ', '_').replace('/', '_')
        
        # Save to Firestore
        db.collection('document_checklist').document(doc_id).set(checklist_document)
        
        return jsonify({
            'success': True,
            'message': 'Checklist created successfully',
            'checklist_id': doc_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@checklist_bp.route('/list-checklists', methods=['GET'])
@require_claims_access
def list_checklists():
    """List all available checklists"""
    try:
        db = get_firestore()
        
        # Get all checklists
        checklists = db.collection('document_checklist').get()
        
        checklist_list = []
        for doc in checklists:
            checklist_data = doc.to_dict()
            checklist_list.append({
                'id': doc.id,
                'payer_name': checklist_data.get('payer_name'),
                'specialty': checklist_data.get('specialty'),
                'document_count': len(checklist_data.get('documents', [])),
                'created_at': str(checklist_data.get('created_at', '')),
                'updated_at': str(checklist_data.get('updated_at', ''))
            })
        
        return jsonify({
            'success': True,
            'checklists': checklist_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_default_checklist():
    """Return default document checklist when no specific checklist is found"""
    return [
        {
            'id': 'discharge_summary',
            'name': 'Discharge Summary',
            'required': True,
            'description': 'Complete discharge summary from the hospital'
        },
        {
            'id': 'medical_records',
            'name': 'Medical Records',
            'required': True,
            'description': 'Complete medical records including treatment details'
        },
        {
            'id': 'bill_receipt',
            'name': 'Hospital Bill/Receipt',
            'required': True,
            'description': 'Original hospital bill with all charges'
        },
        {
            'id': 'prescription',
            'name': 'Prescription',
            'required': False,
            'description': 'Prescription for medications (if applicable)'
        },
        {
            'id': 'lab_reports',
            'name': 'Lab Reports',
            'required': False,
            'description': 'Laboratory test reports (if applicable)'
        },
        {
            'id': 'scan_reports',
            'name': 'Scan/Imaging Reports',
            'required': False,
            'description': 'CT Scan, MRI, X-Ray reports (if applicable)'
        },
        {
            'id': 'authorization_letter',
            'name': 'Authorization Letter',
            'required': True,
            'description': 'Insurance authorization letter'
        },
        {
            'id': 'id_proof',
            'name': 'ID Proof',
            'required': True,
            'description': 'Valid ID proof of the patient'
        }
    ]
