"""
Test the checklist API endpoint
"""
import requests
import json

def test_checklist_api():
    """Test the checklist API endpoint"""
    
    # Test CGHS - Cardiology
    print("🧪 Testing CGHS - Cardiology checklist API...")
    
    url = "http://localhost:5002/api/v1/checklist/get-checklist"
    params = {
        'payer_name': 'CGHS',
        'specialty': 'Cardiology'
    }
    
    try:
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API call successful!")
            print(f"   Success: {data.get('success')}")
            print(f"   Payer: {data.get('payer_name')}")
            print(f"   Specialty: {data.get('specialty')}")
            print(f"   Is Default: {data.get('is_default')}")
            print(f"   Number of documents: {len(data.get('checklist', []))}")
            
            # Show first few documents
            checklist = data.get('checklist', [])
            print("   Documents:")
            for i, doc in enumerate(checklist[:3]):  # Show first 3
                required = "Required" if doc.get('required') else "Optional"
                print(f"     {i+1}. {doc.get('name')} ({required})")
            if len(checklist) > 3:
                print(f"     ... and {len(checklist) - 3} more documents")
                
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server. Make sure the Flask app is running on localhost:5002")
    except Exception as e:
        print(f"❌ Error testing API: {e}")
    
    print()
    
    # Test non-existent combination
    print("🧪 Testing non-existent checklist (should return default)...")
    
    params2 = {
        'payer_name': 'NonExistentPayer',
        'specialty': 'NonExistentSpecialty'
    }
    
    try:
        response2 = requests.get(url, params=params2)
        
        if response2.status_code == 200:
            data2 = response2.json()
            print("✅ API call successful!")
            print(f"   Success: {data2.get('success')}")
            print(f"   Is Default: {data2.get('is_default')}")
            print(f"   Number of documents: {len(data2.get('checklist', []))}")
        else:
            print(f"❌ API call failed with status {response2.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server. Make sure the Flask app is running on localhost:5002")
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == '__main__':
    test_checklist_api()
