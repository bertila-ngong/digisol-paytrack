#!/usr/bin/env python3
"""Test script to verify TextBee SMS sending"""
from dotenv import load_dotenv
import os
import requests

load_dotenv()

TEXTBEE_API_KEY = os.getenv("TEXTBEE_API_KEY")
TEXTBEE_DEVICE_ID = os.getenv("TEXTBEE_DEVICE_ID")
TEXTBEE_BASE_URL = os.getenv("TEXTBEE_BASE_URL", "https://api.textbee.dev/api/v1")

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
test_phone = "+237654499479"  # Without space
test_message = "Test SMS from PayTrack: Payment reminder for your account."

print(f"\n📱 Sending test SMS to {test_phone}...")
print(f"📧 Message: {test_message}\n")

# Correct TextBee API endpoint
url = f"{TEXTBEE_BASE_URL}/gateway/devices/{TEXTBEE_DEVICE_ID}/send-sms"

payload = {
    "recipients": [test_phone],
    "message": test_message
}

headers = {
    "x-api-key": TEXTBEE_API_KEY,
    "Content-Type": "application/json"
}

try:
    print(f"🔍 Endpoint: {url}")
    print(f"📤 Sending request...\n")
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}\n")
    
    if response.status_code in [200, 201]:
        print(f"✅ SUCCESS: SMS sent to {test_phone}!")
    else:
        print(f"❌ FAILED: Check your credentials or phone number format")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
