#!/usr/bin/env python3
"""Test PDF export endpoint"""
import requests

url = "http://127.0.0.1:5000/api/services/export-pdf"

print("=" * 60)
print("Testing PDF Export Endpoint")
print("=" * 60)
print(f"URL: {url}\n")

try:
    response = requests.get(url, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{response.json()}\n")
    
    if response.status_code == 200:
        print("✅ Export successful!")
    else:
        print("❌ Export failed")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
