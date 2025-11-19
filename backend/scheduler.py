from apscheduler.schedulers.background import BackgroundScheduler
from firestore_client import now_iso
from mailer import send_email_sendgrid, send_sms_twilio
from datetime import datetime, timedelta
from useraccounts import db


# db = init_firestore()
ACCOUNTS = "accounts"
LOGS = "reminder_logs"

def check_due_payments():
    """
    Find accounts with due_date == (today + 3 days) and status == unpaid,
    then send notifications to linked users and log results to reminder_logs.
    """
    today = datetime.utcnow().date()
    target = (today + timedelta(days=3)).isoformat()  # "YYYY-MM-DD"
    print(f"[scheduler] Checking accounts with due_date == {target}")

    q = db.collection(ACCOUNTS).where("due_date", "==", target).where("status", "==", "unpaid").stream()
    for doc in q:
        acc = doc.to_dict()
        acc_id = doc.id
        subject = f"Payment due soon for {acc.get('account_number')}"
        message = f"Hello {acc.get('name')}, your payment of {acc.get('payment_amount')} is due on {acc.get('due_date')}. Please pay to avoid interruption."
        linked = acc.get("linked_users", [])
        emails = [u.get("email") for u in linked if u.get("email")]
        phones = [u.get("phone") for u in linked if u.get("phone")]

        if emails:
            try:
                code = send_email_sendgrid(emails, subject, message)
                db.collection(LOGS).add({
                    "account_id": acc_id,
                    "sent_to": ",".join(emails),
                    "channel": "email",
                    "sent_at": now_iso(),
                    "status": f"sent:{code}",
                    "type": "due_3days"
                })
                print(f"Email sent for account {acc_id} to {emails}")
            except Exception as e:
                db.collection(LOGS).add({
                    "account_id": acc_id,
                    "sent_to": ",".join(emails),
                    "channel": "email",
                    "sent_at": now_iso(),
                    "status": f"failed:{str(e)}",
                    "type": "due_3days"
                })
                print(f"Email failed for account {acc_id}: {e}")

        for p in phones:
            try:
                sid = send_sms_twilio(p, message)
                db.collection(LOGS).add({
                    "account_id": acc_id,
                    "sent_to": p,
                    "channel": "sms",
                    "sent_at": now_iso(),
                    "status": f"sent:{sid}",
                    "type": "due_3days"
                })
                print(f"SMS sent for account {acc_id} to {p}")
            except Exception as e:
                db.collection(LOGS).add({
                    "account_id": acc_id,
                    "sent_to": p,
                    "channel": "sms",
                    "sent_at": now_iso(),
                    "status": f"failed:{str(e)}",
                    "type": "due_3days"
                })
                print(f"SMS failed for account {acc_id}: {e}")

def start_scheduler():
    sched = BackgroundScheduler(timezone="UTC")
    # run daily at 08:00 UTC; change cron expression if you want local timezone
    sched.add_job(check_due_payments, 'cron', hour=8, minute=0)
    sched.start()
    print("Scheduler started (APScheduler background scheduler)")
