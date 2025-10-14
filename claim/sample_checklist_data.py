"""
Sample checklist data for testing
Run this script to populate the database with sample checklist data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore
from firebase_admin import firestore

def create_sample_checklists():
    """Create sample checklist data"""
    db = get_firestore()
    
    sample_checklists = [
        {
            'payer_name': 'Health Insurance Corp',
            'specialty': 'Cardiology',
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
                    'id': 'ecg_reports',
                    'name': 'ECG Reports',
                    'required': True,
                    'description': 'Electrocardiogram reports'
                },
                {
                    'id': 'echo_reports',
                    'name': 'Echocardiogram Reports',
                    'required': True,
                    'description': 'Echocardiogram test reports'
                },
                {
                    'id': 'angiography_reports',
                    'name': 'Angiography Reports',
                    'required': False,
                    'description': 'Angiography test reports (if performed)'
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
        },
        {
            'payer_name': 'Health Insurance Corp',
            'specialty': 'GENERAL',
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
        },
        {
            'payer_name': 'Medicare Plus',
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
                },
                {
                    'id': 'mri_reports',
                    'name': 'MRI Reports',
                    'required': False,
                    'description': 'MRI reports (if performed)'
                },
                {
                    'id': 'surgery_notes',
                    'name': 'Surgery Notes',
                    'required': True,
                    'description': 'Detailed surgery notes and procedure details'
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
        }
    ]
    
    for checklist in sample_checklists:
        doc_id = f"{checklist['payer_name']}_{checklist['specialty']}".replace(' ', '_').replace('/', '_')
        
        checklist_document = {
            'payer_name': checklist['payer_name'],
            'specialty': checklist['specialty'],
            'documents': checklist['documents'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': 'system',
            'created_by_email': 'system@example.com'
        }
        
        db.collection('document_checklist').document(doc_id).set(checklist_document)
        print(f"✅ Created checklist for {checklist['payer_name']} - {checklist['specialty']}")
    
    print("🎉 Sample checklist data created successfully!")

if __name__ == '__main__':
    create_sample_checklists()
