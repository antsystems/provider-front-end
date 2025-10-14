"""
Add your existing checklist data to Firestore
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore
from firebase_admin import firestore

def add_your_data():
    """Add your existing checklist data"""
    db = get_firestore()
    
    print("🔧 Adding your existing checklist data...")
    
    # Your existing data structure
    your_checklists = [
        {
            'document_id': 'MV141025GEN001',
            'payer_name': 'CGHS',
            'specialty': 'Cardiology',
            'documents': [
                {
                    'id': 'discharge_summary',
                    'name': 'Discharge Summary',
                    'required': True,
                    'description': 'Complete discharge summary from the hospital'
                }
                # Add more documents as needed
            ]
        },
        {
            'document_id': 'MV241201CHK001', 
            'payer_name': 'CGHS',
            'specialty': 'Orthopedics',
            'documents': [
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
                    'id': 'xray_reports',
                    'name': 'X-Ray Reports',
                    'required': True,
                    'description': 'X-Ray reports of affected area'
                }
            ]
        }
    ]
    
    for checklist in your_checklists:
        doc_id = checklist['document_id']
        
        checklist_document = {
            'payer_name': checklist['payer_name'],
            'specialty': checklist['specialty'],
            'documents': checklist['documents'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': 'user',
            'created_by_email': 'user@example.com',
            'status': 'active'
        }
        
        # Use your existing document ID
        db.collection('document_checklist').document(doc_id).set(checklist_document)
        print(f"✅ Added checklist: {doc_id} - {checklist['payer_name']} - {checklist['specialty']}")
        print(f"   Documents count: {len(checklist['documents'])}")
    
    print("\n🎉 Your existing checklist data added successfully!")
    print("\nNote: This will work alongside the existing test data.")
    print("The API will find the first matching document.")

if __name__ == '__main__':
    add_your_data()
