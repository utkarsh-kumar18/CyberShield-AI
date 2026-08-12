from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from datetime import timedelta

from extensions import db, bcrypt
from models.user import User


auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    email = email.strip().lower()

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    user = User(
        name=name.strip(),
        email=email,
        password=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful"
    }), 201


@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    email = email.strip().lower()

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    password_correct = bcrypt.check_password_hash(
        user.password,
        password
    )

    if not password_correct:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200

@auth.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()

    email = data.get("email")

    if not email:
        return jsonify({
            "message": "Email is required"
        }), 400

    email = email.strip().lower()

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "message": "No account found with this email"
        }), 404

    reset_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "purpose": "password_reset"
        },
        expires_delta=timedelta(minutes=10)
    )

    return jsonify({
        "message": "Account verified",
        "reset_token": reset_token
    }), 200

@auth.route("/reset-password", methods=["POST"])
@jwt_required()
def reset_password():

    claims = get_jwt()

    if claims.get("purpose") != "password_reset":
        return jsonify({
            "message": "Invalid password reset token"
        }), 401

    user_id = get_jwt()["sub"]

    data = request.get_json()

    new_password = data.get("password")

    if not new_password:
        return jsonify({
            "message": "New password is required"
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "message": "Password must be at least 6 characters"
        }), 400

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    user.password = bcrypt.generate_password_hash(
        new_password
    ).decode("utf-8")

    db.session.commit()

    return jsonify({
        "message": "Password reset successful"
    }), 200