import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")

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
