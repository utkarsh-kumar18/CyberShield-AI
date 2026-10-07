"""API gateway routes for scans, user accounts, reports, and administration."""

import hmac
import json
import re
from functools import wraps
from typing import Any, Callable

from flask import Blueprint, current_app, g, jsonify, request
from itsdangerous import BadData, URLSafeTimedSerializer
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from backend.extensions import limiter
from backend.services.analysis import analyze_content
from backend.services.url_analysis import analyze_url
from backend.storage import get_db


api = Blueprint("api", __name__, url_prefix="/api")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _format_timestamp(value: Any) -> str:
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="cybershield-user-token")


def _bearer_user(view: Callable) -> Callable:
    @wraps(view)
    def wrapped(*args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return jsonify({"error": "Bearer token required"}), 401
        try:
            claims = _serializer().loads(token, max_age=current_app.config["TOKEN_TTL_SECONDS"])
        except BadData:
            return jsonify({"error": "Invalid or expired token"}), 401
        g.user_id = int(claims["user_id"])
        return view(*args, **kwargs)

    return wrapped


def _admin_only(view: Callable) -> Callable:
    @wraps(view)
    def wrapped(*args, **kwargs):
        configured_key = current_app.config.get("ADMIN_API_KEY")
        provided_key = request.headers.get("X-Admin-Key", "")
        if not configured_key or not hmac.compare_digest(str(configured_key), provided_key):
            return jsonify({"error": "Admin access denied"}), 403
        return view(*args, **kwargs)

    return wrapped


def _analyze_payload(data: Any) -> tuple[dict | None, tuple | None]:
    if not isinstance(data, dict):
        return None, (jsonify({"error": "JSON object required"}), 400)
    message = data.get("message", "")
    url = data.get("url", "")
    if not isinstance(message, str) or not isinstance(url, str):
        return None, (jsonify({"error": "message and url must be strings"}), 400)
    content = "\n".join(part.strip() for part in (message, url) if part.strip())
    if not content:
        return None, (jsonify({"error": "Provide message text or a URL"}), 400)
    if len(content) > 10_000:
        return None, (jsonify({"error": "Input exceeds the 10,000 character limit"}), 413)
    try:
        return analyze_content(content, current_app.config["SCAM_MODEL"]), None
    except (ValueError, RuntimeError) as error:
        return None, (jsonify({"error": str(error)}), 503)


@api.get("/health")
def health():
    return jsonify({"status": "ok", "service": "CyberShield API Gateway", "ai_model": "loaded"})


@api.post("/analyze")
@api.post("/check-scam")
@limiter.limit("60 per minute")
def analyze():
    result, error = _analyze_payload(request.get_json(silent=True))
    if error:
        return error
    return jsonify(result)


@api.post("/url-scan")
@limiter.limit("60 per minute")
def url_scan():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("url"), str) or not data["url"].strip():
        return jsonify({"error": "A URL string is required"}), 400
    result = analyze_url(data["url"])
    return jsonify(result)


@api.post("/users/register")
@limiter.limit("5 per minute")
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "JSON object required"}), 400
    email = data.get("email", "")
    password = data.get("password", "")
    if not isinstance(email, str) or not EMAIL_RE.fullmatch(email.strip()):
        return jsonify({"error": "A valid email is required"}), 400
    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Password must contain at least 8 characters"}), 400
    db = get_db()
    try:
        user_id = db.execute(
            text("INSERT INTO users (email, password_hash) VALUES (:email, :password_hash) RETURNING id"),
            {"email": email.strip().lower(), "password_hash": generate_password_hash(password)},
        ).scalar_one()
        db.commit()
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "An account with this email already exists"}), 409
    token = _serializer().dumps({"user_id": user_id})
    return jsonify({"user_id": user_id, "email": email.strip().lower(), "token": token}), 201


@api.post("/users/login")
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("email"), str) or not isinstance(data.get("password"), str):
        return jsonify({"error": "Email and password are required"}), 400
    user = get_db().execute(
        text("SELECT id, email, password_hash FROM users WHERE lower(email) = lower(:email)"),
        {"email": data["email"].strip()},
    ).mappings().first()
    if user is None or not check_password_hash(user["password_hash"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({"user_id": user["id"], "email": user["email"], "token": _serializer().dumps({"user_id": user["id"]})})


@api.post("/reports")
@_bearer_user
def create_report():
    result, error = _analyze_payload(request.get_json(silent=True))
    if error:
        return error
    data = request.get_json()
    content = "\n".join(part.strip() for part in (data.get("message", ""), data.get("url", "")) if part.strip())
    db = get_db()
    report_id = db.execute(
        text("INSERT INTO reports (user_id, content, result_json) VALUES (:user_id, :content, :result_json) RETURNING id"),
        {"user_id": g.user_id, "content": content, "result_json": json.dumps(result)},
    ).scalar_one()
    db.commit()
    return jsonify({"report_id": report_id, "result": result}), 201


@api.get("/reports")
@_bearer_user
def list_user_reports():
    rows = get_db().execute(
        text("SELECT id, content, result_json, created_at FROM reports WHERE user_id = :user_id ORDER BY id DESC LIMIT 100"),
        {"user_id": g.user_id},
    ).mappings().all()
    return jsonify({"reports": [
        {"id": row["id"], "content": row["content"], "result": json.loads(row["result_json"]), "created_at": _format_timestamp(row["created_at"])}
        for row in rows
    ]})


@api.get("/admin/analytics")
@_admin_only
def admin_analytics():
    db = get_db()
    total_reports = db.execute(text("SELECT COUNT(*) FROM reports")).scalar_one()
    total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
    rows = db.execute(text("SELECT result_json FROM reports")).mappings().all()
    risk_counts: dict[str, int] = {}
    for row in rows:
        level = json.loads(row["result_json"]).get("risk_level", "UNKNOWN")
        risk_counts[level] = risk_counts.get(level, 0) + 1
    return jsonify({"users": total_users, "reports": total_reports, "risk_level_counts": risk_counts})


@api.get("/admin/reports")
@_admin_only
def admin_reports():
    rows = get_db().execute(
        text(
            "SELECT reports.id, users.email, reports.content, reports.result_json, reports.created_at "
            "FROM reports LEFT JOIN users ON users.id = reports.user_id ORDER BY reports.id DESC LIMIT 100"
        )
    ).mappings().all()
    return jsonify({"reports": [
        {"id": row["id"], "email": row["email"], "content": row["content"], "result": json.loads(row["result_json"]), "created_at": _format_timestamp(row["created_at"])}
        for row in rows
    ]})
