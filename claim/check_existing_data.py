"""
Check the existing checklist data structure in Firestore
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore

def check_existing_data():
    """Check the existing checklist data structure"""
    db = get_firestore()
    
    print("🔍 Checking existing checklist data structure...")
    
    # Get all checklists
    checklists = db.collection('document_checklist').get()
    
    if not checklists:
        print("❌ No checklists found in the database!")
        return
    
    print(f"✅ Found {len(checklists)} checklists:")
    print()
    
    for doc in checklists:
        checklist_data = doc.to_dict()
        
        print(f"📋 Document ID: {doc.id}")
        print(f"   All fields in document:")
        for key, value in checklist_data.items():
            if key == 'documents' and isinstance(value, list):
                print(f"     {key}: [array with {len(value)} items]")
                # Show first document structure
                if value:
                    print(f"       First document structure:")
                    for doc_key, doc_value in value[0].items():
                        print(f"         {doc_key}: {doc_value}")
            else:
                print(f"     {key}: {value}")
        print()
    
    # Specifically check for CGHS Cardiology
    print("🧪 Looking for CGHS Cardiology specifically...")
    
    # Try different field name combinations
    field_combinations = [
        ('payer_name', 'specialty'),
        ('payer', 'specialty'), 
        ('Payer', 'Specialty'),
        ('payer_name', 'specialty_name'),
        ('insurance_provider', 'department')
    ]
    
    for payer_field, specialty_field in field_combinations:
        try:
            query = db.collection('document_checklist').where(payer_field, '==', 'CGHS').where(specialty_field, '==', 'Cardiology')
            docs = query.get()
            
            if docs:
                print(f"✅ Found CGHS Cardiology with fields: {payer_field} = 'CGHS', {specialty_field} = 'Cardiology'")
                doc_data = docs[0].to_dict()
                print(f"   Document ID: {docs[0].id}")
                print(f"   Documents count: {len(doc_data.get('documents', []))}")
                break
        except Exception as e:
            print(f"❌ Error with fields {payer_field}, {specialty_field}: {e}")
    
    print()
    print("🎉 Data structure check complete!")

if __name__ == '__main__':
    check_existing_data()
