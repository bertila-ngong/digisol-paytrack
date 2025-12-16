from flask import Flask
from dotenv import load_dotenv
import os
from routes.accounts import bp as accounts_bp
from routes.health import bp as health_bp
from flask import request, jsonify
from flask_cors import CORS
from database import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config["JSON_SORT_KEYS"] = False

    # Register Blueprint
    app.register_blueprint(accounts_bp)
    app.register_blueprint(health_bp)

    @app.route("/api/services", methods=["GET"])
    def list_services():

        services_ref = db.collection("accounts")
        services = [doc.to_dict() for doc in services_ref.stream()]
        return {"accounts": services}, 200
    
    
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

            # Remove None fields (Firestore doesn't like null overwrites)
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
        
    @app.route("/api/services", methods=["POST"])
    def create_service():
        try:
            data = request.json

            # Prepare structure for Firestore
            account_data = {
                "account_number": data.get("account_number"),
                "due_date": data.get("due_date", ""),
                "payment_amount": data.get("payment_amount", 0),
                "location": data.get("location", ""),
                "name": data.get("name", "New User"),
                "status": data.get("status", "pending"),
                "linked_users": data.get("linked_users", []),
            }

            # Add to Firestore
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
        
    @app.route("/api/services/<account_number>/add-user", methods=["PATCH"])
    def add_linked_user(account_number):
        try:
            data = request.json  # name, email, phone

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

            # Update Firestore
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

            # Allow updating these fields
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
    # CORS(app)

    # Start scheduler AFTER app context exists
    # from scheduler import start_scheduler
    # start_scheduler()

    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)

