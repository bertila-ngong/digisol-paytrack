import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client
import requests

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")
TEXTBEE_API_KEY = os.getenv("TEXTBEE_API_KEY")
TEXTBEE_DEVICE_ID = os.getenv("TEXTBEE_DEVICE_ID")
TEXTBEE_BASE_URL = os.getenv("TEXTBEE_BASE_URL", "https://api.textbee.dev")

def send_email_sendgrid(to_emails, subject, plain_text_content):
    if not SENDGRID_API_KEY:
        raise RuntimeError("SendGrid API key not configured")
    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=to_emails,
        subject=subject,
        plain_text_content=plain_text_content)
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    resp = sg.send(message)
    return resp.status_code

def send_sms_twilio(to_number, body):
    if not (TWILIO_SID and TWILIO_TOKEN and TWILIO_FROM):
        raise RuntimeError("Twilio not configured")
    client = Client(TWILIO_SID, TWILIO_TOKEN)
    message = client.messages.create(body=body, from_=TWILIO_FROM, to=to_number)
    return message.sid

def send_sms_textbee(to_number, body):
    """Send SMS via TextBee API"""
    if not TEXTBEE_API_KEY or not TEXTBEE_DEVICE_ID:
        raise RuntimeError("TextBee not configured (missing API_KEY or DEVICE_ID)")
    
    try:
        url = f"{TEXTBEE_BASE_URL}/api/send"
        headers = {
            "Authorization": f"Bearer {TEXTBEE_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "device_id": TEXTBEE_DEVICE_ID,
            "phone": to_number,
            "message": body
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ TextBee SMS sent to {to_number}: {data}")
        return data.get('message_id', 'success')
    
    except requests.exceptions.RequestException as e:
        print(f"❌ TextBee SMS failed: {e}")
        raise RuntimeError(f"TextBee API error: {e}")

