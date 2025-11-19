from flask import Flask
from dotenv import load_dotenv
import os
from routes.accounts import bp as accounts_bp
from routes.health import bp as health_bp
import flask_cors as CORS
from database import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS.CORS(app)
    app.config["JSON_SORT_KEYS"] = False

    # Register Blueprint
    app.register_blueprint(accounts_bp)
    app.register_blueprint(health_bp)

    @app.route("/api/services", methods=["GET"])
    def list_services():

        services_ref = db.collection("accounts")
        services = [doc.to_dict() for doc in services_ref.stream()]
        return {"accounts": services}, 200

    return app

if __name__ == "__main__":
    app = create_app()

    # Start scheduler AFTER app context exists
    # from scheduler import start_scheduler
    # start_scheduler()

    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)), debug=True)
