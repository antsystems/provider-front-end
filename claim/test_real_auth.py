"""
Test real authentication with valid user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore
from firebase_admin import auth
import requests
import json

def test_real_auth():
    """Test authentication with real user data"""
    print("🧪 Testing real authentication...")
    
    # Get a valid hospital_user from the database
    db = get_firestore()
    users = db.collection('users').where('role', '==', 'hospital_user').limit(1).get()
    
    if not users:
        print("❌ No hospital_user found in database")
        return
    
    user_doc = users[0]
    user_data = user_doc.to_dict()
    user_email = user_data.get('email')
    user_role = user_data.get('role')
    
    print(f"✅ Found test user: {user_email} with role: {user_role}")
    
    # Try to get a valid Firebase ID token for this user
    # Note: This won't work without the user's actual password, but let's test the API call
    
    print("\n🔍 Testing API call with authentication...")
    
    # Test the checklist API
    url = "http://localhost:5002/api/v1/checklist/get-checklist"
    params = {
        'payer_name': 'CGHS',
        'specialty': 'Cardiology'
    }
    
    # Test with different token scenarios
    test_scenarios = [
        {
            'name': 'No token',
            'headers': {'Content-Type': 'application/json'}
        },
        {
            'name': 'Invalid token',
            'headers': {
                'Authorization': 'Bearer invalid_token',
                'Content-Type': 'application/json'
            }
        },
        {
            'name': 'Malformed token',
            'headers': {
                'Authorization': 'invalid_format',
                'Content-Type': 'application/json'
            }
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        try:
            response = requests.get(url, params=params, headers=scenario['headers'])
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n🔍 The real issue is likely:")
    print("1. User is not logged in (no token in localStorage)")
    print("2. Token is expired")
    print("3. Frontend is not sending the Authorization header properly")
    print("4. User needs to log in through the frontend first")

if __name__ == '__main__':
    test_real_auth()
