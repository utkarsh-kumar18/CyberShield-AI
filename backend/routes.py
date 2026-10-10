"""API gateway routes for scans, user accounts, reports, and administration."""

import hmac
import json
import re
from decimal import Decimal, InvalidOperation
from functools import wraps
from typing import Any, Callable
from urllib.parse import urlsplit

from flask import Blueprint, current_app, g, jsonify, request
from itsdangerous import BadData, URLSafeTimedSerializer
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from backend.extensions import limiter
from backend.services.analysis import MODEL_SKLEARN_VERSION, analyze_content, analyze_url_content
from backend.storage import get_db


api = Blueprint("api", __name__, url_prefix="/api")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
FRAUD_TYPES = {"Phishing", "Online Scam", "Financial Fraud", "Identity Theft", "Fake Website", "Other"}


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
        if not message.strip() and url.strip():
            return analyze_url_content(url.strip()), None
        if not current_app.config.get("MODEL_VERSION_COMPATIBLE", False):
            return None, (jsonify({"error": f"Message analysis requires scikit-learn {MODEL_SKLEARN_VERSION}; this runtime has an incompatible model version."}), 503)
        return analyze_content(content, current_app.config["SCAM_MODEL"]), None
    except (ValueError, RuntimeError) as error:
        return None, (jsonify({"error": str(error)}), 503)


@api.get("/health")
def health():
    return jsonify({"status": "ok", "service": "CyberShield API Gateway"})


@api.get("/health/ready")
def readiness():
    checks = {"database": "ok", "model": "ok", "rate_limit_storage": "ok"}
    try:
        get_engine = current_app.extensions["cybershield_db_engine"]
        with get_engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        checks["database"] = "unavailable"
    if current_app.config.get("SCAM_MODEL") is None or not current_app.config.get("MODEL_VERSION_COMPATIBLE", False):
        checks["model"] = "unavailable"
    storage_uri = current_app.config.get("RATELIMIT_STORAGE_URI", "memory://")
    if storage_uri.startswith(("redis://", "rediss://")):
        try:
            from redis import Redis

            client = Redis.from_url(storage_uri, socket_connect_timeout=2, socket_timeout=2)
            client.ping()
            client.close()
        except Exception:
            checks["rate_limit_storage"] = "unavailable"
    elif current_app.config.get("ENVIRONMENT") == "production":
        checks["rate_limit_storage"] = "unavailable"
    ready = all(value == "ok" for value in checks.values())
    return jsonify({"status": "ready" if ready else "not_ready", "checks": checks}), 200 if ready else 503


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
    if len(data["url"].strip()) > 2048:
        return jsonify({"error": "URL exceeds the 2,048 character limit"}), 413
    try:
        result = analyze_url_content(data["url"].strip())
    except (ValueError, RuntimeError) as error:
        return jsonify({"error": str(error)}), 503
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
    if not isinstance(password, str) or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "Password must contain 8 to 128 characters"}), 400
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
    if not isinstance(data, dict) or not isinstance(data.get("email"), str) or not isinstance(data.get("password"), str) or len(data.get("password", "")) > 128:
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


@api.get("/summary")
@_bearer_user
def user_summary():
    db = get_db()
    scan_count = db.execute(
        text("SELECT COUNT(*) FROM reports WHERE user_id = :user_id"),
        {"user_id": g.user_id},
    ).scalar_one()
    incident_count = db.execute(
        text("SELECT COUNT(*) FROM incident_reports WHERE user_id = :user_id"),
        {"user_id": g.user_id},
    ).scalar_one()
    return jsonify({"saved_scans": scan_count, "incident_reports": incident_count})


@api.post("/incident-reports")
@_bearer_user
@limiter.limit("10 per hour")
def create_incident_report():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "JSON object required"}), 400
    fraud_type = data.get("fraud_type")
    description = data.get("description")
    website = data.get("website", "")
    contact = data.get("contact", "")
    amount_value = data.get("amount_lost")
    if not isinstance(fraud_type, str) or fraud_type not in FRAUD_TYPES:
        return jsonify({"error": "Select a valid fraud type"}), 400
    if not isinstance(description, str) or not description.strip() or len(description) > 10_000:
        return jsonify({"error": "Description is required and must be 10,000 characters or fewer"}), 400
    if not isinstance(website, str) or len(website) > 2048:
        return jsonify({"error": "Website URL must be 2,048 characters or fewer"}), 400
    if website.strip():
        parsed = urlsplit(website.strip() if "://" in website else f"https://{website.strip()}")
        try:
            invalid_port = parsed.port is not None and not 1 <= parsed.port <= 65535
        except ValueError:
            invalid_port = True
        if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password or invalid_port:
            return jsonify({"error": "Enter a valid website URL"}), 400
    if not isinstance(contact, str) or len(contact) > 80:
        return jsonify({"error": "Contact details must be 80 characters or fewer"}), 400
    amount = None
    if amount_value not in (None, ""):
        try:
            amount = Decimal(str(amount_value))
            if not amount.is_finite() or amount < 0 or amount >= Decimal("1000000000000") or amount.as_tuple().exponent < -2:
                raise InvalidOperation
            amount = amount.quantize(Decimal("0.01"))
        except (InvalidOperation, ValueError):
            return jsonify({"error": "Amount lost must be a non-negative number with at most 2 decimal places"}), 400
    db = get_db()
    incident_id = db.execute(
        text(
            "INSERT INTO incident_reports (user_id, fraud_type, description, website, contact, amount_lost) "
            "VALUES (:user_id, :fraud_type, :description, :website, :contact, :amount_lost) RETURNING id"
        ),
        {
            "user_id": g.user_id,
            "fraud_type": fraud_type,
            "description": description.strip(),
            "website": website.strip() or None,
            "contact": contact.strip() or None,
            "amount_lost": str(amount) if amount is not None else None,
        },
    ).scalar_one()
    db.commit()
    return jsonify({"incident_id": incident_id, "status": "received"}), 201


@api.get("/incident-reports")
@_bearer_user
def list_user_incidents():
    rows = get_db().execute(
        text(
            "SELECT id, fraud_type, description, website, amount_lost, created_at "
            "FROM incident_reports WHERE user_id = :user_id ORDER BY id DESC LIMIT 100"
        ),
        {"user_id": g.user_id},
    ).mappings().all()
    return jsonify({"incident_reports": [
        {
            "id": row["id"],
            "fraud_type": row["fraud_type"],
            "description": row["description"],
            "website": row["website"],
            "amount_lost": str(row["amount_lost"]) if row["amount_lost"] is not None else None,
            "created_at": _format_timestamp(row["created_at"]),
        }
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
