"""
Document management routes for file uploads and storage
Role-based access: hospital_user, claim_processor, reconciler ONLY
"""
from flask import Blueprint, request, jsonify
from app.config.firebase_config import get_firestore, get_storage
from app.middleware.auth_middleware import require_claims_access
from firebase_admin import firestore, storage
from datetime import datetime
import uuid
import os
from werkzeug.utils import secure_filename

documents_bp = Blueprint('documents', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documents_bp.route('/upload', methods=['POST'])
@require_claims_access
def upload_document():
    """Upload document for a claim"""
    try:
        # Get form data
        claim_id = request.form.get('claim_id')
        document_type = request.form.get('document_type')
        document_name = request.form.get('document_name')
        
        if not claim_id or not document_type or not document_name:
            return jsonify({
                'success': False,
                'error': 'claim_id, document_type, and document_name are required'
            }), 400
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Get user info
        user_id = request.headers.get('X-User-ID', '')
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        # Create storage path: IP_Claims/{hospital_id}/{claim_id}/{document_type}/{filename}
        storage_path = f"IP_Claims/{hospital_id}/{claim_id}/{document_type}/{unique_filename}"
        
        # Upload to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        
        # Upload file
        blob.upload_from_file(file, content_type=file.content_type)
        
        # Make file publicly accessible (optional - you might want to keep it private)
        blob.make_public()
        
        # Get download URL
        download_url = blob.public_url
        
        # Save document metadata to Firestore
        db = get_firestore()
        document_id = f"doc_{uuid.uuid4().hex[:8]}"
        
        document_metadata = {
            'document_id': document_id,
            'claim_id': claim_id,
            'document_type': document_type,
            'document_name': document_name,
            'original_filename': secure_filename(file.filename),
            'storage_path': storage_path,
            'download_url': download_url,
            'file_size': len(file.read()),
            'file_type': file.content_type,
            'uploaded_by': user_id,
            'hospital_id': hospital_id,
            'uploaded_at': firestore.SERVER_TIMESTAMP,
            'status': 'uploaded'
        }
        
        # Reset file pointer for size calculation
        file.seek(0)
        document_metadata['file_size'] = len(file.read())
        
        # Save to documents collection
        db.collection('documents').document(document_id).set(document_metadata)
        
        # Update claim document to include document reference
        claim_ref = db.collection('claims').document(claim_id)
        claim_doc = claim_ref.get()
        
        if claim_doc.exists:
            claim_data = claim_doc.to_dict()
            documents = claim_data.get('documents', [])
            documents.append({
                'document_id': document_id,
                'document_type': document_type,
                'document_name': document_name,
                'uploaded_at': str(document_metadata['uploaded_at']),
                'status': 'uploaded'
            })
            
            claim_ref.update({
                'documents': documents,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'document_id': document_id,
            'download_url': download_url,
            'storage_path': storage_path
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@documents_bp.route('/get-claim-documents/<claim_id>', methods=['GET'])
@require_claims_access
def get_claim_documents(claim_id):
    """Get all documents for a specific claim"""
    try:
        db = get_firestore()
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        # Get claim document
        claim_doc = db.collection('claims').document(claim_id).get()
        
        if not claim_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Claim not found'
            }), 404
        
        claim_data = claim_doc.to_dict()
        
        # Check if claim belongs to user's hospital
        if claim_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Get documents from claim
        documents = claim_data.get('documents', [])
        
        # Get detailed document information
        detailed_documents = []
        for doc in documents:
            doc_id = doc.get('document_id')
            if doc_id:
                doc_detailed = db.collection('documents').document(doc_id).get()
                if doc_detailed.exists:
                    doc_data = doc_detailed.to_dict()
                    detailed_documents.append({
                        'document_id': doc_data.get('document_id'),
                        'document_type': doc_data.get('document_type'),
                        'document_name': doc_data.get('document_name'),
                        'original_filename': doc_data.get('original_filename'),
                        'download_url': doc_data.get('download_url'),
                        'file_size': doc_data.get('file_size'),
                        'file_type': doc_data.get('file_type'),
                        'uploaded_at': str(doc_data.get('uploaded_at', '')),
                        'status': doc_data.get('status')
                    })
        
        return jsonify({
            'success': True,
            'claim_id': claim_id,
            'documents': detailed_documents
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@documents_bp.route('/delete-document/<document_id>', methods=['DELETE'])
@require_claims_access
def delete_document(document_id):
    """Delete a document"""
    try:
        db = get_firestore()
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        # Get document metadata
        doc_ref = db.collection('documents').document(document_id)
        doc_doc = doc_ref.get()
        
        if not doc_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Document not found'
            }), 404
        
        doc_data = doc_doc.to_dict()
        
        # Check if document belongs to user's hospital
        if doc_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        # Delete from Firebase Storage
        try:
            bucket = storage.bucket()
            blob = bucket.blob(doc_data.get('storage_path'))
            blob.delete()
        except Exception as e:
            print(f"Error deleting from storage: {e}")
        
        # Remove from claim documents list
        claim_id = doc_data.get('claim_id')
        if claim_id:
            claim_ref = db.collection('claims').document(claim_id)
            claim_doc = claim_ref.get()
            
            if claim_doc.exists:
                claim_data = claim_doc.to_dict()
                documents = claim_data.get('documents', [])
                documents = [doc for doc in documents if doc.get('document_id') != document_id]
                
                claim_ref.update({
                    'documents': documents,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
        
        # Delete document metadata
        doc_ref.delete()
        
        return jsonify({
            'success': True,
            'message': 'Document deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@documents_bp.route('/download/<document_id>', methods=['GET'])
@require_claims_access
def download_document(document_id):
    """Get download URL for a document"""
    try:
        db = get_firestore()
        hospital_id = request.headers.get('X-Hospital-ID', '')
        
        # Get document metadata
        doc_doc = db.collection('documents').document(document_id).get()
        
        if not doc_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Document not found'
            }), 404
        
        doc_data = doc_doc.to_dict()
        
        # Check if document belongs to user's hospital
        if doc_data.get('hospital_id') != hospital_id:
            return jsonify({
                'success': False,
                'error': 'Access denied'
            }), 403
        
        return jsonify({
            'success': True,
            'download_url': doc_data.get('download_url'),
            'document_name': doc_data.get('document_name'),
            'original_filename': doc_data.get('original_filename')
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
