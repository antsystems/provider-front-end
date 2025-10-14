"""
Firebase configuration and initialization
"""
import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.config.config import Config

# Global Firebase instances
db = None
storage_client = None

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global db, storage_client
    
    try:
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(Config.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'storageBucket': Config.FIREBASE_STORAGE_BUCKET
        })
        
        # Initialize Firestore
        db = firestore.client()
        
        # Initialize Storage
        storage_client = storage.bucket()
        
        print("✅ Firebase Admin SDK initialized successfully")
        
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        raise e

def get_firestore():
    """Get Firestore client instance"""
    global db
    if db is None:
        initialize_firebase()
    return db

def get_storage():
    """Get Firebase Storage client instance"""
    global storage_client
    if storage_client is None:
        initialize_firebase()
    return storage_client
