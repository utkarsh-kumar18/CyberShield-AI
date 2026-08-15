import os
from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt, jwt

from models.user import User
from models.scan import Scan
from routes.auth import auth
from routes.scanner import scanner
from routes.message_scanner import message_scanner
from routes.fraud_reports import fraud_reports
from routes.analytics import analytics
from routes.admin import admin

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": os.getenv(
                "FRONTEND_URL",
                "http://localhost:5173"
            ),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }
)

app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

app.register_blueprint(
    auth,
    url_prefix="/api/auth"
)

app.register_blueprint(
    scanner,
    url_prefix="/api/scan"
)

app.register_blueprint(
    message_scanner,
    url_prefix="/api/scan"
)

app.register_blueprint(
    fraud_reports,
    url_prefix="/api/fraud"
)

app.register_blueprint(
    analytics,
    url_prefix="/api/analytics"
)

app.register_blueprint(
    admin,
    url_prefix="/api/admin"
)


@app.route("/")
def home():

    return {
        "message": "CyberShield AI Backend is running"
    }


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    import os

    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    app.run(debug=debug_mode)