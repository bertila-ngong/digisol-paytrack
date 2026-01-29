from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
import os
from routes.accounts import bp as accounts_bp
from routes.health import bp as health_bp
import flask_cors as CORS
from database import db
from datetime import date, datetime
from flask_mail import Mail, Message
import requests
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io

load_dotenv()

# --- CONSTANTS ---
SETTINGS_DOC_ID = "app_config"
DEFAULT_SETTINGS = {
    "email_notifications": True,
    "sms_notifications": True,
    "push_notifications": True,
    "reminder_days_before": 3,
}

def calculate_status(due_date_str):
    """Calculate status based on due date"""
    try:
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        today = date.today()
        
        if due_date < today:
            return "overdue"
        else:
            return "pending"
    except:
        return "pending"

def send_reminder_email(mail_instance, app_context, recipient_email, account_name, due_date, days_before):
    """Send email reminder via Flask-Mail SMTP"""
    try:
        with app_context:
            subject = f"🔔 Reminder: {account_name} Payment Due in a few day(s)!"
            
            body = (
                f"Hi,\n\n"
                f"This is a reminder that your payment for *{account_name}* "
                f"is due on *{due_date}*, which is just a few days away.\n\n"
                f"Thanks,\n"
                f"The Payment Manager App"
            )

            msg = Message(
                subject=subject,
                recipients=[recipient_email],
                body=body
            )

            mail_instance.send(msg) 
            print(f"✅ SMTP success: Email reminder sent to {recipient_email} for {account_name}")
            return True
    except Exception as e:
        print(f"❌ SMTP Error: Failed to send email to {recipient_email}: {e}")
        import traceback
        traceback.print_exc()
        return False

def send_sms(phone_number, message):
    """Send SMS via TextBee API"""
    try:
        api_key = os.getenv("TEXTBEE_API_KEY")
        device_id = os.getenv("TEXTBEE_DEVICE_ID")
        base_url = os.getenv("TEXTBEE_BASE_URL", "https://api.textbee.dev/api/v1")
        
        if not api_key or not device_id:
            print(f"❌ SMS Config Error: Missing TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID")
            return False
        
        url = f"{base_url}/gateway/devices/{device_id}/send-sms"
        
        payload = {
            "recipients": [phone_number],
            "message": message
        }

        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json"
        }

        print(f"  📤 Sending SMS to {phone_number}")
        print(f"  📍 Endpoint: {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"✅ SMS sent to {phone_number}")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ SMS failed (Status {response.status_code}): {response.text}")
            return False

    except Exception as e:
        print(f"❌ SMS Exception: {e}")
        import traceback
        traceback.print_exc()
        return False


def create_app():
    app = Flask(__name__)
    CORS.CORS(app)
    app.config["JSON_SORT_KEYS"] = False
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Register Blueprints
    app.register_blueprint(accounts_bp)
    app.register_blueprint(health_bp)

    # Mail configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Validate SMTP configuration
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("⚠️  WARNING: MAIL_USERNAME or MAIL_PASSWORD not configured in .env")

    # Initialize Flask-Mail
    mail = Mail(app)

    # ==================== EXPORT ACCOUNTS TO PDF ====================
    @app.route("/api/services/export-pdf", methods=["GET"])
    def export_accounts_pdf():
        """Export all accounts data to a PDF file"""
        try:
            print("📄 Starting PDF export...")
            
            # Fetch all accounts
            accounts_ref = db.collection("accounts")
            accounts_list = []
            
            for doc in accounts_ref.stream():
                data = doc.to_dict()
                accounts_list.append(data)
            
            print(f"📊 Found {len(accounts_list)} accounts to export")
            
            if not accounts_list:
                return jsonify({
                    "success": False,
                    "message": "No accounts found to export"
                }), 404
            
            # Create PDF in memory
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
            elements = []
            
            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#7C3AED'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.grey,
                spaceAfter=20,
                alignment=TA_CENTER
            )
            
            # Title
            title = Paragraph("DigiSol PayTrack", title_style)
            elements.append(title)
            
            subtitle = Paragraph(
                f"Accounts Export Report - {datetime.now().strftime('%B %d, %Y')}",
                subtitle_style
            )
            elements.append(subtitle)
            elements.append(Spacer(1, 0.3*inch))
            
            # Summary statistics
            total_accounts = len(accounts_list)
            overdue_accounts = sum(1 for acc in accounts_list if acc.get('status') == 'overdue')
            paid_accounts = sum(1 for acc in accounts_list if acc.get('status') == 'paid')
            pending_accounts = sum(1 for acc in accounts_list if acc.get('status') == 'pending')
            
            summary_data = [
                ['Total Accounts', 'Overdue', 'Paid', 'Pending'],
                [str(total_accounts), str(overdue_accounts), str(paid_accounts), str(pending_accounts)]
            ]
            
            summary_table = Table(summary_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7C3AED')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
            ]))
            
            elements.append(summary_table)
            elements.append(Spacer(1, 0.5*inch))
            
            # Accounts table header
            accounts_header = Paragraph("<b>All Accounts</b>", styles['Heading2'])
            elements.append(accounts_header)
            elements.append(Spacer(1, 0.2*inch))
            
            # Prepare accounts data for table
            table_data = [
                ['Account #', 'Name', 'Amount (XAF)', 'Due Date', 'Status', 'Location']
            ]
            
            for account in accounts_list:
                account_number = account.get('account_number', 'N/A')
                name = account.get('name', 'Unknown')
                amount = f"{account.get('payment_amount', 0):,}"
                due_date = account.get('due_date', 'N/A')
                status = account.get('status', 'pending').upper()
                location = account.get('location', 'N/A')
                
                table_data.append([
                    account_number,
                    name,
                    amount,
                    due_date,
                    status,
                    location
                ])
            
            # Create table
            col_widths = [1.2*inch, 1.3*inch, 1.1*inch, 1.0*inch, 0.9*inch, 1.0*inch]
            accounts_table = Table(table_data, colWidths=col_widths, repeatRows=1)
            
            # Table style
            table_style = TableStyle([
                # Header
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7C3AED')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 0), (-1, 0), 10),
                
                # Data rows
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('TOPPADDING', (0, 1), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ])
            
            # Color code status column
            for i, account in enumerate(accounts_list, start=1):
                status = account.get('status', 'pending')
                if status == 'overdue':
                    table_style.add('TEXTCOLOR', (4, i), (4, i), colors.red)
                    table_style.add('FONTNAME', (4, i), (4, i), 'Helvetica-Bold')
                elif status == 'paid':
                    table_style.add('TEXTCOLOR', (4, i), (4, i), colors.green)
                    table_style.add('FONTNAME', (4, i), (4, i), 'Helvetica-Bold')
                else:
                    table_style.add('TEXTCOLOR', (4, i), (4, i), colors.orange)
            
            accounts_table.setStyle(table_style)
            elements.append(accounts_table)
            
            # Build PDF
            doc.build(elements)
            
            # Return PDF as file download instead of saving to disk
            buffer.seek(0)
            filename = f"accounts_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            print(f"✅ PDF created successfully: {filename}")
            
            return send_file(
                buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
            
        except Exception as e:
            print(f"❌ PDF Export Error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "message": str(e)
            }), 500

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
                recipient_email = account.get("email")
                
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
            print(f"\n📨 [SEND REMINDER] Received request for account: {account_number}")
            docs = db.collection("accounts").where("account_number", "==", account_number).stream()
            doc = next(docs, None)
            if not doc:
                print(f"❌ Account {account_number} not found")
                return jsonify({"success": False, "message": "Account not found"}), 404
            
            doc_ref = doc.reference
            account_data = doc.to_dict()
            print(f"📋 Account data retrieved: {account_data.get('name')}")
            
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID).get()
            settings = settings_ref.to_dict() if settings_ref.exists else DEFAULT_SETTINGS
            print(f"⚙️  Email notifications enabled: {settings.get('email_notifications', True)}")

            email_sent = False
            if settings.get("email_notifications", True):
                recipient_email = account_data.get('email')
                
                if not recipient_email:
                    linked_users = account_data.get('linked_users', [])
                    if linked_users and len(linked_users) > 0:
                        recipient_email = linked_users[0].get('email')
                        print(f"📧 Email found in linked_users: {recipient_email}")
                
                if recipient_email:
                    print(f"🚀 Sending email to {recipient_email}...")
                    email_sent = send_reminder_email(
                        mail_instance=mail,
                        app_context=app.app_context(),
                        recipient_email=recipient_email,
                        account_name=account_data.get('name') or 'Payment',
                        due_date=account_data.get('due_date', 'N/A'),
                        days_before=settings.get('reminder_days_before', 3)
                    )
                else:
                    print(f"⚠️  No email address found for account {account_number}")

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

            return jsonify({"success": True, "message": "Reminder sent", "email_sent": email_sent}), 200

        except Exception as e:
            print("Error processing reminder:", e)
            return jsonify({"success": False, "error": str(e)}), 500

    # ==================== SEND SMS REMINDER ====================
    @app.route("/api/services/send-sms-reminder/<account_number>", methods=["POST"])
    def send_sms_reminder(account_number):
        try:
            print(f"\n📱 [SEND SMS REMINDER] Received request for account: {account_number}")
            docs = db.collection("accounts").where("account_number", "==", account_number).stream()
            doc = next(docs, None)
            if not doc:
                print(f"❌ Account {account_number} not found")
                return jsonify({"success": False, "message": "Account not found"}), 404
            
            doc_ref = doc.reference
            account_data = doc.to_dict()
            print(f"📋 Account data retrieved: {account_data.get('name')}")
            
            settings_ref = db.collection("settings").document(SETTINGS_DOC_ID).get()
            settings = settings_ref.to_dict() if settings_ref.exists else DEFAULT_SETTINGS
            print(f"⚙️  SMS notifications enabled: {settings.get('sms_notifications', True)}")

            sms_sent = False
            if settings.get("sms_notifications", True):
                recipient_phone = account_data.get('phone')
                
                if not recipient_phone:
                    linked_users = account_data.get('linked_users', [])
                    if linked_users and len(linked_users) > 0:
                        recipient_phone = linked_users[0].get('phone')
                        print(f"📱 Phone found in linked_users: {recipient_phone}")
                
                if recipient_phone:
                    print(f"🚀 Sending SMS to {recipient_phone}...")
                    sms_message = (
                        f"Reminder: Your payment for {account_data.get('name') or 'Payment'} "
                        f"of {account_data.get('payment_amount', 'N/A')} is due on {account_data.get('due_date', 'N/A')}. "
                        f"Thank you!"
                    )
                    sms_sent = send_sms(recipient_phone, sms_message)
                else:
                    print(f"⚠️  No phone number found for account {account_number}")

            return jsonify({"success": True, "message": "SMS reminder sent", "sms_sent": sms_sent}), 200

        except Exception as e:
            print("Error processing SMS reminder:", e)
            return jsonify({"success": False, "error": str(e)}), 500

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
            
            # Auto-update status based on due_date if not paid
            if data.get("status") != "paid" and data.get("due_date"):
                calculated_status = calculate_status(data["due_date"])
                if data.get("status") != calculated_status:
                    # Update in database
                    services_ref.document(doc.id).update({"status": calculated_status})
                    data["status"] = calculated_status
            
            accounts_list.append(data)
        return {"accounts": accounts_list}, 200

    # ==================== CREATE ACCOUNT ====================
    @app.route("/api/services", methods=["POST"])
    def create_service():
        try:
            data = request.json
            
            # Calculate initial status based on due_date
            due_date = data.get("due_date", "")
            initial_status = calculate_status(due_date) if due_date else "pending"
            
            # Get location from linked_users if provided
            linked_users = data.get("linked_users", [])
            location = data.get("location", "")
            if not location and linked_users:
                location = linked_users[0].get("location", "")
            
            # Update linked_users to include location
            if linked_users and location:
                for user in linked_users:
                    if "location" not in user or not user["location"]:
                        user["location"] = location
            
            # Extract email and phone from first linked user if not provided directly
            email = data.get("email", "")
            phone = data.get("phone", "")
            if not email and linked_users:
                email = linked_users[0].get("email", "")
            if not phone and linked_users:
                phone = linked_users[0].get("phone", "")
            
            account_data = {
                "account_number": data.get("account_number"),
                "due_date": due_date,
                "payment_amount": data.get("payment_amount", 0),
                "location": location,
                "name": data.get("name", "New User"),
                "email": email,
                "phone": phone,
                "status": initial_status,
                "linked_users": linked_users,
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
            
            # Auto-update status if needed
            if account_data.get("status") != "paid" and account_data.get("due_date"):
                calculated_status = calculate_status(account_data["due_date"])
                if account_data.get("status") != calculated_status:
                    services_ref.document(matched_doc.id).update({"status": calculated_status})
                    account_data["status"] = calculated_status
            
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
                "phone": data.get("phone", ""),
                "location": data.get("location", "")
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

       # ==================== UPDATE LINKED USERS ====================
    @app.route("/api/services/<account_number>/update-users", methods=["PATCH"])
    def update_linked_users(account_number):
        try:
            data = request.json
            if not data or "linked_users" not in data:
                return jsonify({
                    "success": False,
                    "message": "Invalid request body - linked_users required"
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
            
            linked_users = data.get("linked_users", [])
            
            services_ref.document(matched_doc.id).update({
                "linked_users": linked_users
            })
            
            return jsonify({
                "success": True,
                "message": "Linked users updated successfully",
                "linked_users": linked_users
            }), 200
        except Exception as e:
            print("Error updating linked users:", e)
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
            
            # Get current account data
            account_data = matched_doc.to_dict()
            
            update_fields = {}
            
            # Handle all fields independently
            if "account_number" in data:
                update_fields["account_number"] = data["account_number"]
            if "due_date" in data:
                update_fields["due_date"] = data["due_date"]
                # Auto-calculate status when due_date changes (unless already paid)
                if account_data.get("status") != "paid":
                    update_fields["status"] = calculate_status(data["due_date"])
            if "payment_amount" in data:
                update_fields["payment_amount"] = data["payment_amount"]
            if "location" in data:
                update_fields["location"] = data["location"]
            if "status" in data:
                update_fields["status"] = data["status"]
            if "name" in data:
                update_fields["name"] = data["name"]
            
            # Email and phone are independent top-level fields
            if "email" in data:
                update_fields["email"] = data["email"]
            if "phone" in data:
                update_fields["phone"] = data["phone"]
            
            # Allow direct linked_users update if provided
            if "linked_users" in data:
                update_fields["linked_users"] = data["linked_users"]
            
            # Perform the update
            services_ref.document(matched_doc.id).update(update_fields)
            
            return jsonify({
                "success": True,
                "message": "Account updated successfully",
                "updated": update_fields
            }), 200
        except Exception as e:
            print("Error updating account:", e)
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