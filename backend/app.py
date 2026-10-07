"""Flask application factory and API gateway entry point."""

import os
import secrets
from pathlib import Path
from uuid import uuid4

from flask import Flask, g, jsonify, request

from backend.routes import api
from backend.extensions import limiter
from backend.services.analysis import load_model
from backend.storage import close_db, create_database_engine, init_db


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def create_app(config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv("CYBERSHIELD_SECRET_KEY") or secrets.token_hex(32),
        ADMIN_API_KEY=os.getenv("CYBERSHIELD_ADMIN_API_KEY"),
        DATABASE_URL=os.getenv("CYBERSHIELD_DATABASE_URL"),
        DATABASE=os.getenv("CYBERSHIELD_DATABASE", str(PROJECT_ROOT / "instance" / "cybershield.sqlite3")),
        ENVIRONMENT=os.getenv("CYBERSHIELD_ENV", "development").lower(),
        RATELIMIT_STORAGE_URI=os.getenv("CYBERSHIELD_RATE_LIMIT_STORAGE_URI", "memory://"),
        TOKEN_TTL_SECONDS=60 * 60 * 24,
        MAX_CONTENT_LENGTH=1_000_000,
        SCAM_MODEL=None,
    )
    if config:
        app.config.update(config)
    if app.config["ENVIRONMENT"] == "production":
        if not os.getenv("CYBERSHIELD_SECRET_KEY") or not app.config["ADMIN_API_KEY"]:
            raise RuntimeError("Production requires CYBERSHIELD_SECRET_KEY and CYBERSHIELD_ADMIN_API_KEY.")
        if app.config["RATELIMIT_STORAGE_URI"].startswith("memory://"):
            raise RuntimeError("Production requires shared Redis storage via CYBERSHIELD_RATE_LIMIT_STORAGE_URI.")
        database_url = str(app.config["DATABASE_URL"] or "")
        if not database_url.startswith(("postgresql://", "postgresql+psycopg://")):
            raise RuntimeError("Production requires PostgreSQL via CYBERSHIELD_DATABASE_URL.")
    if app.config["SCAM_MODEL"] is None:
        app.config["SCAM_MODEL"] = load_model()

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
        g.request_id = request.headers.get("X-Request-ID", str(uuid4()))

    @app.after_request
    def add_gateway_headers(response):
        response.headers["X-Request-ID"] = g.request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
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
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "5000")),
        threads=int(os.getenv("WAITRESS_THREADS", "8")),
    )
