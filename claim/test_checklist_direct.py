"""
Test checklist functionality directly without API authentication
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore

def test_checklist_direct():
    """Test checklist functionality directly"""
    db = get_firestore()
    
    print("🧪 Testing CGHS - Cardiology checklist directly...")
    
    try:
        # Test the exact query the API uses
        query = db.collection('document_checklist').where('payer_name', '==', 'CGHS').where('specialty', '==', 'Cardiology')
        docs = query.get()
        
        if docs:
            print("✅ Found CGHS - Cardiology checklist!")
            doc = docs[0]
            data = doc.to_dict()
            
            print(f"   Document ID: {doc.id}")
            print(f"   Payer: {data.get('payer_name')}")
            print(f"   Specialty: {data.get('specialty')}")
            print(f"   Documents count: {len(data.get('documents', []))}")
            
            # Show the documents
            documents = data.get('documents', [])
            print(f"   Documents:")
            for i, doc_item in enumerate(documents):
                required = "Required" if doc_item.get('required') else "Optional"
                print(f"     {i+1}. {doc_item.get('name')} ({required})")
                print(f"        Description: {doc_item.get('description')}")
            
            print("\n✅ This matches what the API should return!")
            
        else:
            print("❌ No CGHS - Cardiology checklist found!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🧪 Testing CGHS - Orthopedics checklist...")
    
    try:
        query2 = db.collection('document_checklist').where('payer_name', '==', 'CGHS').where('specialty', '==', 'Orthopedics')
        docs2 = query2.get()
        
        if docs2:
            print("✅ Found CGHS - Orthopedics checklist!")
            doc2 = docs2[0]
            data2 = doc2.to_dict()
            
            print(f"   Document ID: {doc2.id}")
            print(f"   Documents count: {len(data2.get('documents', []))}")
            
        else:
            print("❌ No CGHS - Orthopedics checklist found!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_checklist_direct()
