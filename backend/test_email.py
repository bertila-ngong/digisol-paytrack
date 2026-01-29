#!/usr/bin/env python3
"""Test script to verify email sending"""
from dotenv import load_dotenv
import os
from flask_mail import Mail, Message
from flask import Flask

load_dotenv()

app = Flask(__name__)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

print("=" * 60)
print("SMTP Configuration Check")
print("=" * 60)
print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
print(f"MAIL_USE_TLS: {app.config['MAIL_USE_TLS']}")
print(f"MAIL_USE_SSL: {app.config['MAIL_USE_SSL']}")
print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
print(f"MAIL_PASSWORD: {'*' * len(app.config['MAIL_PASSWORD']) if app.config['MAIL_PASSWORD'] else 'NOT SET'}")
print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
print("=" * 60)

if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
    print("❌ ERROR: MAIL_USERNAME or MAIL_PASSWORD not configured!")
    exit(1)

mail = Mail(app)

with app.app_context():
    try:
        print("\n📧 Attempting to send test email...")
        msg = Message(
            subject="Test Email from PayTrack",
            recipients=[app.config['MAIL_USERNAME']],
            body="This is a test email to verify SMTP configuration."
        )
        mail.send(msg)
        print("✅ SUCCESS: Test email sent!")
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
