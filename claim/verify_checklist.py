"""
Verify checklist data in Firestore
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore

def verify_checklists():
    """Verify all checklists in the database"""
    db = get_firestore()
    
    print("🔍 Checking all checklists in Firestore...")
    
    # Get all checklists
    checklists = db.collection('document_checklist').get()
    
    if not checklists:
        print("❌ No checklists found in the database!")
        return
    
    print(f"✅ Found {len(checklists)} checklists:")
    print()
    
    for doc in checklists:
        checklist_data = doc.to_dict()
        payer_name = checklist_data.get('payer_name', 'Unknown')
        specialty = checklist_data.get('specialty', 'Unknown')
        documents = checklist_data.get('documents', [])
        
        print(f"📋 {payer_name} - {specialty}")
        print(f"   Document ID: {doc.id}")
        print(f"   Number of documents: {len(documents)}")
        
        # Show required documents
        required_docs = [doc for doc in documents if doc.get('required', False)]
        optional_docs = [doc for doc in documents if not doc.get('required', False)]
        
        print(f"   Required documents: {len(required_docs)}")
        for doc_item in required_docs:
            print(f"     - {doc_item.get('name', 'Unknown')}")
        
        print(f"   Optional documents: {len(optional_docs)}")
        for doc_item in optional_docs:
            print(f"     - {doc_item.get('name', 'Unknown')}")
        
        print()
    
    # Test specific CGHS - Cardiology lookup
    print("🧪 Testing CGHS - Cardiology lookup...")
    cghs_cardiology_query = db.collection('document_checklist').where('payer_name', '==', 'CGHS').where('specialty', '==', 'Cardiology')
    cghs_docs = cghs_cardiology_query.get()
    
    if cghs_docs:
        print("✅ CGHS - Cardiology checklist found!")
        cghs_data = cghs_docs[0].to_dict()
        print(f"   Document ID: {cghs_docs[0].id}")
        print(f"   Number of documents: {len(cghs_data.get('documents', []))}")
    else:
        print("❌ CGHS - Cardiology checklist NOT found!")
    
    print()
    print("🎉 Checklist verification complete!")

if __name__ == '__main__':
    verify_checklists()
