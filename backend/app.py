"""Flask application factory and API gateway entry point."""

import os
import hmac
import secrets
from pathlib import Path
from uuid import uuid4

from flask_cors import CORS

from flask import Flask, g, jsonify, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

from backend.routes import api
from backend.extensions import limiter
from backend.services.analysis import load_model, model_version_compatible
from backend.storage import close_db, create_database_engine, init_db


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def create_app(config: dict | None = None) -> Flask:
    frontend_dist = PROJECT_ROOT / "frontend" / "dist"
    app = Flask(__name__, static_folder=None)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://127.0.0.1:5173",
                    "http://localhost:5173"
                ]
            }
        },
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"]
    )
    app.config.from_mapping(
        SECRET_KEY=os.getenv("CYBERSHIELD_SECRET_KEY") or secrets.token_hex(32),
        ADMIN_API_KEY=os.getenv("CYBERSHIELD_ADMIN_API_KEY"),
        DATABASE_URL=os.getenv("CYBERSHIELD_DATABASE_URL"),
        DATABASE=os.getenv("CYBERSHIELD_DATABASE", str(PROJECT_ROOT / "instance" / "cybershield.sqlite3")),
        ENVIRONMENT=os.getenv("CYBERSHIELD_ENV", "development").lower(),
        RATELIMIT_STORAGE_URI=os.getenv("CYBERSHIELD_RATE_LIMIT_STORAGE_URI", "memory://"),
        TOKEN_TTL_SECONDS=60 * 60 * 24,
        MAX_CONTENT_LENGTH=1_000_000,
        TRUSTED_PROXY_HOPS=int(os.getenv("CYBERSHIELD_TRUSTED_PROXY_HOPS", "0")),
        MODEL_VERSION_COMPATIBLE=None,
        SCAM_MODEL=None,
    )
    if config:
        app.config.update(config)
    proxy_hops = int(app.config["TRUSTED_PROXY_HOPS"])
    if proxy_hops < 0 or proxy_hops > 5:
        raise RuntimeError("CYBERSHIELD_TRUSTED_PROXY_HOPS must be between 0 and 5.")
    if proxy_hops:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=proxy_hops, x_proto=proxy_hops, x_host=proxy_hops)
    if app.config["ENVIRONMENT"] == "production":
        secret_key = str(app.config.get("SECRET_KEY") or "")
        admin_key = str(app.config.get("ADMIN_API_KEY") or "")
        if (
            not os.getenv("CYBERSHIELD_SECRET_KEY")
            or not os.getenv("CYBERSHIELD_ADMIN_API_KEY")
            or len(secret_key) < 32
            or len(admin_key) < 32
            or "change_me" in secret_key.lower()
            or "change_me" in admin_key.lower()
        ):
            raise RuntimeError("Production requires unique CYBERSHIELD_SECRET_KEY and CYBERSHIELD_ADMIN_API_KEY values of at least 32 characters.")
        if hmac.compare_digest(secret_key, admin_key):
            raise RuntimeError("Production secret key and admin API key must be different.")
        if not app.config["RATELIMIT_STORAGE_URI"].startswith(("redis://", "rediss://")):
            raise RuntimeError("Production requires shared Redis storage via CYBERSHIELD_RATE_LIMIT_STORAGE_URI.")
        database_url = str(app.config["DATABASE_URL"] or "")
        if not database_url.startswith(("postgresql://", "postgresql+psycopg://")):
            raise RuntimeError("Production requires PostgreSQL via CYBERSHIELD_DATABASE_URL.")
    if app.config["SCAM_MODEL"] is None:
        app.config["SCAM_MODEL"] = load_model()
        app.config["MODEL_VERSION_COMPATIBLE"] = model_version_compatible()
    elif app.config["MODEL_VERSION_COMPATIBLE"] is None:
        app.config["MODEL_VERSION_COMPATIBLE"] = True

    app.extensions["cybershield_db_engine"] = create_database_engine(
        app.config["DATABASE_URL"], app.config["DATABASE"]
    )
    app.register_blueprint(api)
    app.register_blueprint(api, name="api_v1", url_prefix="/api/v1")
    limiter.init_app(app)
    app.teardown_appcontext(close_db)

    if app.config["ENVIRONMENT"] != "production":
        init_db(app.extensions["cybershield_db_engine"])

    @app.before_request
    def assign_request_id():
        supplied_request_id = request.headers.get("X-Request-ID", "")
        g.request_id = supplied_request_id[:128] if supplied_request_id and supplied_request_id.isascii() and all(char.isalnum() or char in "-_." for char in supplied_request_id[:128]) else str(uuid4())

    @app.before_request
    def serve_built_frontend():
        index_file = frontend_dist / "index.html"
        if not index_file.is_file() or request.method != "GET" or request.path == "/api" or request.path.startswith("/api/"):
            return None
        relative_path = request.path.lstrip("/")
        if relative_path:
            candidate = (frontend_dist / relative_path).resolve()
            if candidate.is_relative_to(frontend_dist.resolve()) and candidate.is_file():
                return send_from_directory(frontend_dist, relative_path)
            if Path(relative_path).suffix:
                return None
        return send_from_directory(frontend_dist, "index.html")

    @app.after_request
    def add_gateway_headers(response):
        response.headers["X-Request-ID"] = g.request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.path.startswith("/assets/"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.errorhandler(413)
    def request_too_large(_error):
        return jsonify({"error": "Request body exceeds the 1 MB limit"}), 413

    @app.errorhandler(400)
    def bad_request(_error):
        return jsonify({"error": "Invalid request"}), 400

    @app.errorhandler(429)
    def too_many_requests(_error):
        return jsonify({"error": "Rate limit exceeded", "request_id": g.request_id}), 429

    @app.get("/")
    def home():
        return jsonify({
            "service": "CyberShield AI",
            "status": "running",
            "api": "/api",
            "health": "/api/health",
        })

    return app


app = create_app()


if __name__ == "__main__":
    from waitress import serve

    serve(
        app,
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
        threads=int(os.getenv("WAITRESS_THREADS", "8")),
    )
