from flask import Blueprint, jsonify

bp = Blueprint("health", __name__, url_prefix="/health")

@bp.route("", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200
