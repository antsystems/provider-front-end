"""
Test the API call exactly as the frontend would make it
"""
import requests
import json

def test_frontend_api_call():
    """Test the API call exactly as the frontend would make it"""
    
    print("🧪 Testing API call exactly as frontend would make it...")
    
    url = "http://localhost:5002/api/v1/checklist/get-checklist"
    params = {
        'payer_name': 'CGHS',
        'specialty': 'Cardiology'
    }
    
    headers = {
        'Authorization': 'Bearer test_token',  # This will fail auth but let's see the response
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 401:
            print("\n❌ Authentication failed - this is expected with a test token")
            print("The frontend needs a valid auth token from localStorage")
            
        elif response.status_code == 200:
            data = response.json()
            print("✅ API call successful!")
            print(f"Checklist data: {json.dumps(data, indent=2)}")
            
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🔍 Let's also test without authentication to see the exact error:")
    
    try:
        response2 = requests.get(url, params=params)
        print(f"Status Code (no auth): {response2.status_code}")
        print(f"Response Body (no auth): {response2.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_frontend_api_call()
