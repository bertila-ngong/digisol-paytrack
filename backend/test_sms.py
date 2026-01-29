#!/usr/bin/env python3
"""Test script to verify TextBee SMS sending"""
from dotenv import load_dotenv
import os
import requests

load_dotenv()

TEXTBEE_API_KEY = os.getenv("TEXTBEE_API_KEY")
TEXTBEE_DEVICE_ID = os.getenv("TEXTBEE_DEVICE_ID")
TEXTBEE_BASE_URL = os.getenv("TEXTBEE_BASE_URL", "https://api.textbee.dev")

print("=" * 60)
print("TextBee SMS Configuration Check")
print("=" * 60)
print(f"TEXTBEE_API_KEY: {'*' * len(TEXTBEE_API_KEY) if TEXTBEE_API_KEY else 'NOT SET'}")
print(f"TEXTBEE_DEVICE_ID: {TEXTBEE_DEVICE_ID}")
print(f"TEXTBEE_BASE_URL: {TEXTBEE_BASE_URL}")
print("=" * 60)

if not TEXTBEE_API_KEY or not TEXTBEE_DEVICE_ID:
    print("❌ ERROR: TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID not configured!")
    exit(1)

# Test SMS
test_phone = "+237 654499479"
test_message = "Test SMS from PayTrack: Payment reminder for your account."

print(f"\n📱 Sending test SMS to {test_phone}...")
print(f"📧 Message: {test_message}\n")

endpoints = [
    f"{TEXTBEE_BASE_URL}/api/send",
    f"{TEXTBEE_BASE_URL}/send",
    f"{TEXTBEE_BASE_URL}/messages/send",
]

payload = {
    "device_id": TEXTBEE_DEVICE_ID,
    "to": test_phone,
    "phone": test_phone,
    "body": test_message,
    "message": test_message
}

headers = {
    "Authorization": f"Bearer {TEXTBEE_API_KEY}",
    "Content-Type": "application/json"
}

success = False
for url in endpoints:
    try:
        print(f"🔍 Trying: {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: SMS sent to {test_phone}!")
            print(f"   Response: {response.json()}")
            success = True
            break
        else:
            print(f"   Response: {response.text[:100]}")
    except Exception as e:
        print(f"   Error: {e}")

if not success:
    print("\n⚠️  Could not send SMS. Please verify:")
    print("   1. TEXTBEE_API_KEY is correct")
    print("   2. TEXTBEE_DEVICE_ID is correct") 
    print("   3. TEXTBEE_BASE_URL is correct")
    print("   4. Phone number format is correct")
