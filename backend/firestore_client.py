import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def init_firestore():
    """
    Initialize Firebase Admin SDK (only once) and return a Firestore client.
    Uses path from GOOGLE_APPLICATION_CREDENTIALS or defaults to serviceAccountKey.json.
    """
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
    if not firebase_admin._apps:
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def now_iso():
    """Return current UTC time as ISO 8601 string with Z suffix."""
    return datetime.utcnow().isoformat() + "Z"
