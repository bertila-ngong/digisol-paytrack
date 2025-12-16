from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from routes.accounts import bp as accounts_bp
from routes.health import bp as health_bp
import flask_cors as CORS  # You had this alias, kept it
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

    # Mail configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Initialize Flask-Mail
    mail = Mail(app)

    def send_reminder_email(recipient_email, account_name, due_date, days_before):
        try:
            with app.app_context(): 
                subject = f"🔔 Reminder: {account_name} Payment Due in {days_before} Day(s)!"
                
                body = (
                    f"Hi,\n\n"
                    f"This is a reminder that your payment for *{account_name}* "
                    f"is due on *{due_date}*, which is just {days_before} day(s) away.\n\n"
                    f"Thanks,\n"
                    f"The Payment Manager App"
                )

                msg = Message(
                    subject=subject,
                    recipients=[recipient_email],
                    body=body
                )

                mail.send(msg) 
                print(f"✅ SMTP success: Email reminder sent to {recipient_email} for {account_name}")
                return True
        except Exception as e:
            print(f"❌ SMTP Error: Failed to send email to {recipient_email}: {e}")
            return False

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

    # ==================== SEND REMINDER ====================
    @app.route("/api/services/send-reminder/<account_number>", methods=["POST"])
    def send_reminder(account_number):
        try:
            docs = db.collection("accounts").where("account_number", "==", account_number).stream()
            doc = next(docs, None)
            if not doc:
                return {"success": False, "message": "Account not found"}, 404
            
            doc_ref = doc.reference
            account_data = doc.to_dict()
            
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID).get()
            settings = settings_ref.to_dict() if settings_ref.exists else DEFAULT_SETTINGS

            if settings.get("email_notifications", False):
                recipient_email = account_data.get('email')
                
                if recipient_email:
                    send_reminder_email(
                        recipient_email=recipient_email,
                        account_name=account_data.get('name') or 'Payment',
                        due_date=account_data.get('due_date', 'N/A'),
                        days_before=settings.get('reminder_days_before', 3)
                    )

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
                    pass
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
        try:
            updates = request.get_json()
            if not updates:
                return jsonify({"message": "No data provided"}), 400
            
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID)
            settings_ref.set(updates, merge=True) 
            
            if "reminder_days_before" in updates:
                print(f"Reminder days updated to: {updates['reminder_days_before']}")
            
            return jsonify({"success": True, "message": "Settings updated"}), 200

        except Exception as e:
            print("Error updating settings:", e)
            return jsonify({"error": "Failed to save settings"}), 500

    # ==================== LIST ALL ACCOUNTS ====================
    @app.route("/api/services", methods=["GET"])
    def list_services():
        services_ref = db.collection("accounts")
        accounts_list = []
        for doc in services_ref.stream():
            data = doc.to_dict()
            data["id"] = doc.id
            accounts_list.append(data)
        return {"accounts": accounts_list}, 200

    # ==================== CREATE ACCOUNT (from friend's code) ====================
    @app.route("/api/services", methods=["POST"])
    def create_service():
        try:
            data = request.json
            account_data = {
                "account_number": data.get("account_number"),
                "due_date": data.get("due_date", ""),
                "payment_amount": data.get("payment_amount", 0),
                "location": data.get("location", ""),
                "name": data.get("name", "New User"),
                "status": data.get("status", "pending"),
                "linked_users": data.get("linked_users", []),
            }
            doc_ref = db.collection("accounts").document()
            account_data["id"] = doc_ref.id
            doc_ref.set(account_data)
            return jsonify({
                "success": True,
                "message": "Account created successfully",
                "account": account_data
            }), 201
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    # ==================== GET SINGLE ACCOUNT BY ACCOUNT NUMBER ====================
    @app.route("/api/services/<account_number>", methods=["GET"])
    def get_account_by_number(account_number):
        try:
            services_ref = db.collection("accounts")
            docs = services_ref.where("account_number", "==", account_number).stream()
            matched_doc = None
            for doc in docs:
                matched_doc = doc
                break
            if not matched_doc:
                return jsonify({
                    "success": False,
                    "message": "Account not found"
                }), 404
            account_data = matched_doc.to_dict()
            return jsonify({
                "success": True,
                "account": account_data
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    # ==================== MARK AS PAID ====================
    @app.route("/api/services/mark-paid/<account_number>", methods=["PUT"])
    def mark_payment_paid(account_number):
        try:
            services_ref = db.collection("accounts")
            docs = services_ref.where("account_number", "==", account_number).stream()
            matched_doc = None
            for doc in docs:
                matched_doc = doc
                break
            if not matched_doc:
                return jsonify({
                    "success": False,
                    "message": "Account not found"
                }), 404
            update_data = {
                "status": "paid",
                "paid_date": request.json.get("paid_date", None)
            }
            update_data = {k: v for k, v in update_data.items() if v is not None}
            services_ref.document(matched_doc.id).update(update_data)
            return jsonify({
                "success": True,
                "message": f"Account {account_number} marked as paid"
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    # ==================== ADD LINKED USER ====================
    @app.route("/api/services/<account_number>/add-user", methods=["PATCH"])
    def add_linked_user(account_number):
        try:
            data = request.json
            if not data or "name" not in data:
                return jsonify({
                    "success": False,
                    "message": "Invalid request body"
                }), 400
            services_ref = db.collection("accounts")
            docs = services_ref.where("account_number", "==", account_number).stream()
            matched_doc = None
            for doc in docs:
                matched_doc = doc
                break
            if not matched_doc:
                return jsonify({
                    "success": False,
                    "message": "Account not found"
                }), 404
            account_data = matched_doc.to_dict()
            linked_users = account_data.get("linked_users", [])
            linked_users.append({
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "phone": data.get("phone", "")
            })
            services_ref.document(matched_doc.id).update({
                "linked_users": linked_users
            })
            return jsonify({
                "success": True,
                "message": "Linked user added successfully",
                "linked_users": linked_users
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    # ==================== UPDATE ACCOUNT ====================
    @app.route("/api/services/<account_number>", methods=["PUT"])
    def update_account(account_number):
        try:
            data = request.json
            services_ref = db.collection("accounts")
            docs = services_ref.where("account_number", "==", account_number).stream()
            matched_doc = None
            for doc in docs:
                matched_doc = doc
                break
            if not matched_doc:
                return jsonify({
                    "success": False,
                    "message": "Account not found"
                }), 404
            update_fields = {}
            if "account_number" in data:
                update_fields["account_number"] = data["account_number"]
            if "due_date" in data:
                update_fields["due_date"] = data["due_date"]
            if "payment_amount" in data:
                update_fields["payment_amount"] = data["payment_amount"]
            if "location" in data:
                update_fields["location"] = data["location"]
            if "status" in data:
                update_fields["status"] = data["status"]
            if "linked_users" in data:
                update_fields["linked_users"] = data["linked_users"]
            if "name" in data:
                update_fields["name"] = data["name"]
            services_ref.document(matched_doc.id).update(update_fields)
            return jsonify({
                "success": True,
                "message": "Account updated successfully",
                "updated": update_fields
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    # ==================== DELETE ACCOUNT ====================
    @app.route("/api/services/<account_number>", methods=["DELETE"])
    def delete_account(account_number):
        try:
            services_ref = db.collection("accounts")
            docs = services_ref.where("account_number", "==", account_number).stream()
            matched_doc = None
            for doc in docs:
                matched_doc = doc
                break
            if not matched_doc:
                return jsonify({
                    "success": False,
                    "message": "Account not found"
                }), 404
            services_ref.document(matched_doc.id).delete()
            return jsonify({
                "success": True,
                "message": f"Account {account_number} deleted successfully"
            }), 200
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)