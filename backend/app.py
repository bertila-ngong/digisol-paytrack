from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    # Register Blueprints
    from routes.accounts import bp as accounts_bp
    from routes.health import bp as health_bp
    app.register_blueprint(accounts_bp)
    app.register_blueprint(health_bp)

    return app

if __name__ == "__main__":
    app = create_app()

    # Start scheduler AFTER app context exists
    from scheduler import start_scheduler
    start_scheduler()

    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
