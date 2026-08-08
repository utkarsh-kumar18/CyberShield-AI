from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt, jwt

from models.user import User
from routes.auth import auth


app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

app.register_blueprint(
    auth,
    url_prefix="/api/auth"
)


@app.route("/")
def home():

    return {
        "message": "CyberShield AI Backend is running"
    }


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)