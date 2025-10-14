"""
Check your existing checklist data specifically
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore

def check_your_data():
    """Check your existing checklist data"""
    db = get_firestore()
    
    print("🔍 Checking your existing checklist data...")
    
    # Check for your specific document IDs
    your_doc_ids = ['MV241201CHK001', 'MV141025GEN001']
    
    for doc_id in your_doc_ids:
        print(f"\n📋 Checking document: {doc_id}")
        
        try:
            doc = db.collection('document_checklist').document(doc_id).get()
            
            if doc.exists:
                data = doc.to_dict()
                print(f"✅ Document exists!")
                print(f"   All fields:")
                for key, value in data.items():
                    if key == 'documents' and isinstance(value, list):
                        print(f"     {key}: [array with {len(value)} items]")
                        # Show all documents
                        for i, doc_item in enumerate(value):
                            print(f"       Document {i+1}:")
                            for doc_key, doc_value in doc_item.items():
                                print(f"         {doc_key}: {doc_value}")
                    else:
                        print(f"     {key}: {value}")
            else:
                print(f"❌ Document does not exist!")
                
        except Exception as e:
            print(f"❌ Error checking document: {e}")
    
    print("\n🧪 Testing API query for your data...")
    
    # Test the exact query the API uses
    try:
        query = db.collection('document_checklist').where('payer_name', '==', 'CGHS').where('specialty', '==', 'Cardiology')
        docs = query.get()
        
        print(f"✅ Query found {len(docs)} documents:")
        for doc in docs:
            data = doc.to_dict()
            print(f"   Document ID: {doc.id}")
            print(f"   Payer: {data.get('payer_name')}")
            print(f"   Specialty: {data.get('specialty')}")
            print(f"   Documents count: {len(data.get('documents', []))}")
            
    except Exception as e:
        print(f"❌ Error with API query: {e}")

if __name__ == '__main__':
    check_your_data()
