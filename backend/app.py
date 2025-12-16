# backend/app.py
from flask import Flask, request, jsonify  # <-- NEW IMPORTS
from dotenv import load_dotenv
import os
from routes.accounts import bp as accounts_bp
from routes.health import bp as health_bp
import flask_cors as CORS
from database import db
from datetime import date, datetime
from flask_mail import Mail, Message

load_dotenv()

# --- CONSTANTS ---
SETTINGS_DOC_ID = "app_config"
DEFAULT_SETTINGS = {
    "email_notifications": True,
    "sms_notifications": True,
    "push_notifications": True,
    "reminder_days_before": 3,
}

def create_app():
    app = Flask(__name__)
    CORS.CORS(app)
    app.config["JSON_SORT_KEYS"] = False
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Register Blueprints
    app.register_blueprint(accounts_bp)
    app.register_blueprint(health_bp)
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # --- 2. Initialize Flask-Mail ---
    mail = Mail(app) # The mail object

    def send_reminder_email(recipient_email, account_name, due_date, days_before):
        try:
            # Must run inside the application context (e.g., in a background task)
            with app.app_context(): 
                subject = f"🔔 Reminder: {account_name} Payment Due in {days_before} Day(s)!"
                
                body = (
                    f"Hi,\n\n"
                    f"This is a reminder that your payment for **{account_name}** "
                    f"is due on **{due_date}**, which is just {days_before} day(s) away.\n\n"
                    f"Thanks,\n"
                    f"The Payment Manager App"
                )

                msg = Message(
                    subject=subject,
                    recipients=[recipient_email],
                    body=body
                )

                # This line uses the SMTP configuration defined in app.config
                mail.send(msg) 
                print(f"✅ SMTP success: Email reminder sent to {recipient_email} for {account_name}")
                return True
        except Exception as e:
            print(f"❌ SMTP Error: Failed to send email to {recipient_email}: {e}")
            return False
        
    # backend/app.py (inside create_app)

    # ==================== GET ELIGIBLE REMINDERS FOR MANUAL SEND ====================
    @app.route("/api/services/eligible-reminders", methods=["GET"])
    def get_eligible_reminders():
        """Fetches accounts eligible for 5-day or 1-day reminders today."""
        
        today = date.today()
        target_reminders = {5, 1}
        eligible_accounts = []

        try:
            accounts_ref = db.collection("accounts")
            for doc in accounts_ref.stream():
                account = doc.to_dict()
                doc_id = doc.id
                
                due_date_str = account.get('due_date')
                recipient_email = account.get('email')
                
                if not due_date_str or not recipient_email:
                    continue

                due_date_obj = datetime.strptime(due_date_str, "%Y-%m-%d").date()
                days_diff = (due_date_obj - today).days

                if days_diff in target_reminders:
                    reminder_key = f"reminder_sent_{days_diff}_days"
                    
                    # Check if this specific reminder has NOT been sent
                    if not account.get(reminder_key, False):
                        eligible_accounts.append({
                            "id": doc_id,
                            "account_name": account.get("name"),
                            "due_date": due_date_str,
                            "days_to_send": days_diff,
                            "recipient": recipient_email,
                            "account_number": account.get("account_number")
                        })

            return jsonify({"eligible_accounts": eligible_accounts}), 200

        except Exception as e:
            print("Error fetching eligible reminders:", e)
            return jsonify({"error": "Failed to fetch eligible reminders"}), 500

    # ==================== SEND REMINDER (MODIFIED) ====================
    @app.route("/api/services/send-reminder/<account_number>", methods=["POST"])
    def send_reminder(account_number):
        try:
            # 1. Find the Account Document
            docs = db.collection("accounts").where("account_number", "==", account_number).stream()
            doc = next(docs, None)
            if not doc:
                return {"success": False, "message": "Account not found"}, 404
            
            doc_ref = doc.reference
            account_data = doc.to_dict()
            
            # 2. Get Settings (to check if email is enabled and get days_before)
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID).get()
            settings = settings_ref.to_dict() if settings_ref.exists else DEFAULT_SETTINGS

            # --- EMAIL SENDING LOGIC ---
            if settings.get("email_notifications", False):
                # ASSUMPTION: 'user_email' field exists on the account document
                recipient_email = account_data.get('email')
                
                if recipient_email:
                    # Call the helper function defined above
                    send_reminder_email(
                        recipient_email=recipient_email,
                        account_name = account_data.get('name') or account_data.get('name ', '').strip() or 'Payment',
                        due_date=account_data.get('due_date', 'N/A'),
                        days_before=settings.get('reminder_days_before', 3)
                    )
                else:
                    print(f"Warning: Email notifications enabled but no user_email found for {account_number}")

            # 3. Update Firestore (Mark as sent)
            # Figure out how many days before this reminder was
            due_date_str = account_data.get('due_date')
            if due_date_str:
                try:
                    due_date_obj = datetime.strptime(due_date_str, "%Y-%m-%d").date()
                    days_diff = (due_date_obj - date.today()).days
                    if days_diff in {1, 5}:
                        reminder_key = f"reminder_sent_{days_diff}_days"
                        doc_ref.update({
                            reminder_key: True,
                            "reminder_sent": True,
                            "reminder_sent_date": datetime.now().strftime("%Y-%m-%d"),
                            "last_manual_reminder": datetime.now().isoformat()
                        })
                    else:
                        doc_ref.update({
                            "reminder_sent": True,
                            "reminder_sent_date": datetime.now().strftime("%Y-%m-%d")
                        })
                except:
                    pass  # fallback
            else:
                doc_ref.update({
                    "reminder_sent": True,
                    "reminder_sent_date": datetime.now().strftime("%Y-%m-%d")
                })

            return {"success": True, "message": "Reminder (and email if enabled) processed"}, 200

        except Exception as e:
            print("Error processing reminder:", e)
            return {"success": False, "error": str(e)}, 500

    # ==================== SETTINGS ROUTES ====================
    @app.route("/api/settings", methods=["GET"])
    def get_settings():
        """Fetches the current application settings."""
        try:
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID).get()
            
            if settings_ref.exists:
                data = settings_ref.to_dict()
                return jsonify(data), 200
            else:
                db.collection("settings").document(SETTINGS_DOC_ID).set(DEFAULT_SETTINGS)
                return jsonify(DEFAULT_SETTINGS), 200

        except Exception as e:
            print("Error getting settings:", e)
            return jsonify({"error": "Failed to load settings"}), 500

    @app.route("/api/settings", methods=["PUT"])
    def update_settings():
        """Updates specific fields in the settings document."""
        try:
            updates = request.get_json()
            if not updates:
                return jsonify({"message": "No data provided"}), 400
            
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID)
            
            # Use merge=True to only update the keys provided
            settings_ref.set(updates, merge=True) 
            
            if "reminder_days_before" in updates:
                # LOGIC TRIGGERED HERE for background reminder job!
                print(f"Reminder days updated to: {updates['reminder_days_before']}")
            
            return jsonify({"success": True, "message": "Settings updated"}), 200

        except Exception as e:
            print("Error updating settings:", e)
            return jsonify({"error": "Failed to save settings"}), 500
            
    # ==================== GET ALL ACCOUNTS (existing) ====================
    @app.route("/api/services", methods=["GET"])
    def list_services():
        services_ref = db.collection("accounts")
        accounts_list = []
        for doc in services_ref.stream():
            data = doc.to_dict()
            data["id"] = doc.id
            accounts_list.append(data)
        return {"accounts": accounts_list}, 200

    # ==================== SEND REMINDER (existing) ====================
    # @app.route("/api/services/send-reminder/<account_number>", methods=["POST"])
    # def send_reminder(account_number):
    #     # ... (Your existing send_reminder implementation) ...
    #     try:
    #         # ... (rest of existing send_reminder function)
    #         docs = db.collection("accounts").where("account_number", "==", account_number).stream()
    #         doc_ref = None
    #         for doc in docs:
    #             doc_ref = doc.reference
    #             break

    #         if not doc_ref:
    #             return {"success": False, "message": "Account not found"}, 404

    #         doc_ref.update({
    #             "reminder_sent": True,
    #             "reminder_sent_date": datetime.now().strftime("%Y-%m-%d")
    #         })

    #         return {"success": True, "message": "Reminder marked as sent"}, 200

    #     except Exception as e:
    #         print("Error sending reminder:", e)
    #         return {"success": False, "error": str(e)}, 500


    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)