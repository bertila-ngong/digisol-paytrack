from flask import Blueprint, request, jsonify
from firestore_client import now_iso
from datetime import datetime
from database import db

bp = Blueprint("accounts", __name__, url_prefix="/api/accounts")

# db = init_firestore()
ACCOUNTS = "accounts"
LOGS = "reminder_logs"

@bp.route("", methods=["POST"])
def create_account():
    data = request.get_json()
    required = ["name", "account_number", "payment_amount", "due_date"]
    for r in required:
        if r not in data:
            return jsonify({"error": f"missing {r}"}), 400

    doc = {
        "name": data["name"],
        "location": data.get("location"),
        "account_number": data["account_number"],
        "payment_amount": float(data["payment_amount"]),
        "due_date": data["due_date"],  # expect YYYY-MM-DD
        "status": data.get("status", "unpaid"),
        "linked_users": data.get("linked_users", []),
        "created_at": now_iso(),
        "updated_at": now_iso()
    }
    ref = db.collection(ACCOUNTS).document()
    ref.set(doc)
    return jsonify({"message": "created", "id": ref.id}), 201

@bp.route("", methods=["GET"])
def list_accounts():
    docs = db.collection(ACCOUNTS).stream()
    res = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        res.append(item)
    return jsonify(res), 200

@bp.route("/<account_id>", methods=["PUT"])
def update_account(account_id):
    data = request.get_json()
    ref = db.collection(ACCOUNTS).document(account_id)
    if not ref.get().exists:
        return jsonify({"error": "not found"}), 404
    data["updated_at"] = now_iso()
    ref.update(data)
    return jsonify({"message": "updated"}), 200

@bp.route("/mark_paid/<account_id>", methods=["PUT"])
def mark_paid(account_id):
    ref = db.collection(ACCOUNTS).document(account_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({"error": "not found"}), 404
    ref.update({"status": "paid", "updated_at": now_iso()})
    return jsonify({"message": "marked as paid"}), 200
