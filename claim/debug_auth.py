"""
Debug authentication issues
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.firebase_config import get_firestore
from firebase_admin import auth
import json

def debug_auth():
    """Debug authentication issues"""
    print("🔍 Debugging authentication issues...")
    
    # Check if we can access Firestore
    try:
        db = get_firestore()
        print("✅ Firestore connection working")
    except Exception as e:
        print(f"❌ Firestore connection failed: {e}")
        return
    
    # Test token verification
    print("\n🧪 Testing token verification...")
    
    # Test with a sample token format
    test_tokens = [
        "invalid_token",
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "",
        None
    ]
    
    for token in test_tokens:
        try:
            if token:
                decoded = auth.verify_id_token(token)
                print(f"✅ Token verified: {token[:20]}...")
            else:
                print(f"❌ Empty token")
        except Exception as e:
            print(f"❌ Token verification failed for '{token}': {e}")
    
    print("\n🔍 Checking user collection...")
    
    try:
        # Check if users collection exists and has data
        users = db.collection('users').limit(5).get()
        print(f"✅ Users collection accessible, found {len(users)} users")
        
        for user in users:
            user_data = user.to_dict()
            print(f"   User: {user_data.get('email', 'No email')} - Role: {user_data.get('role', 'No role')}")
            
    except Exception as e:
        print(f"❌ Error accessing users collection: {e}")
    
    print("\n🔍 Checking auth middleware logic...")
    
    # Simulate the auth middleware logic
    print("Auth middleware expects:")
    print("1. Authorization header with 'Bearer <token>' format")
    print("2. Valid Firebase ID token")
    print("3. User exists in Firestore users collection")
    print("4. User role is in ALLOWED_CLAIMS_ROLES")
    
    print("\nPossible issues:")
    print("1. Frontend not sending Authorization header")
    print("2. Token not in localStorage or expired")
    print("3. User not logged in properly")
    print("4. User role not authorized")

if __name__ == '__main__':
    debug_auth()
