"""
Add CGHS specific checklist data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore
from firebase_admin import firestore

def add_cghs_checklists():
    """Add CGHS specific checklist data"""
    db = get_firestore()
    
    cghs_checklists = [
        {
            'payer_name': 'CGHS',
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
                    'id': 'cghs_referral',
                    'name': 'CGHS Referral Letter',
                    'required': True,
                    'description': 'CGHS referral letter for treatment'
                },
                {
                    'id': 'cghs_card',
                    'name': 'CGHS Card Copy',
                    'required': True,
                    'description': 'Copy of CGHS beneficiary card'
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
                    'id': 'lab_reports',
                    'name': 'Lab Reports',
                    'required': False,
                    'description': 'Laboratory test reports (if applicable)'
                },
                {
                    'id': 'prescription',
                    'name': 'Prescription',
                    'required': False,
                    'description': 'Prescription for medications (if applicable)'
                }
            ]
        },
        {
            'payer_name': 'CGHS',
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
                    'id': 'cghs_referral',
                    'name': 'CGHS Referral Letter',
                    'required': True,
                    'description': 'CGHS referral letter for treatment'
                },
                {
                    'id': 'cghs_card',
                    'name': 'CGHS Card Copy',
                    'required': True,
                    'description': 'Copy of CGHS beneficiary card'
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
                    'id': 'prescription',
                    'name': 'Prescription',
                    'required': False,
                    'description': 'Prescription for medications (if applicable)'
                }
            ]
        },
        {
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
                    'id': 'cghs_referral',
                    'name': 'CGHS Referral Letter',
                    'required': True,
                    'description': 'CGHS referral letter for treatment'
                },
                {
                    'id': 'cghs_card',
                    'name': 'CGHS Card Copy',
                    'required': True,
                    'description': 'Copy of CGHS beneficiary card'
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
                    'id': 'lab_reports',
                    'name': 'Lab Reports',
                    'required': False,
                    'description': 'Laboratory test reports (if applicable)'
                }
            ]
        }
    ]
    
    for checklist in cghs_checklists:
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
        print(f"✅ Created CGHS checklist for {checklist['payer_name']} - {checklist['specialty']}")
    
    print("🎉 CGHS checklist data created successfully!")

if __name__ == '__main__':
    add_cghs_checklists()
