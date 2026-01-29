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
test_phone = input("\n📱 Enter your phone number (with country code, e.g. +1234567890): ")
test_message = "Test SMS from PayTrack: This is a test message to verify TextBee integration."

print(f"\n📧 Attempting to send test SMS to {test_phone}...")

try:
    # Try with API key as query parameter
    url = f"{TEXTBEE_BASE_URL}/api/send"
    
    payload = {
        "device_id": TEXTBEE_DEVICE_ID,
        "to": test_phone,
        "body": test_message,
        "api_key": TEXTBEE_API_KEY
    }
    
    # Try 1: With Authorization header
    print(f"\n🔍 Trying with Bearer token authorization...")
    headers = {
        "Authorization": f"Bearer {TEXTBEE_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code not in [200, 201]:
        # Try 2: With query parameter
        print(f"\n🔍 Trying with query parameter...")
        headers = {"Content-Type": "application/json"}
        response = requests.post(f"{url}?api_key={TEXTBEE_API_KEY}", json=payload, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
    
    print(f"Response: {response.json() if response.text else 'No response'}")
    
    if response.status_code in [200, 201]:
        print(f"✅ SUCCESS: Test SMS sent!")
    else:
        print(f"❌ FAILED: {response.text}")
        
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
