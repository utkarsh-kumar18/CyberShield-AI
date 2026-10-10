"""SQLAlchemy storage shared by local SQLite and production PostgreSQL."""

from pathlib import Path

from flask import current_app, g
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    event,
    func,
)
from sqlalchemy.engine import URL


metadata = MetaData()
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String(320), nullable=False, unique=True),
    Column("password_hash", Text, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)
reports = Table(
    "reports",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="SET NULL")),
    Column("content", Text, nullable=False),
    Column("result_json", Text, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)
Index("reports_created_at_idx", reports.c.created_at)
Index("reports_user_id_idx", reports.c.user_id)

incident_reports = Table(
    "incident_reports",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("fraud_type", String(40), nullable=False),
    Column("description", Text, nullable=False),
    Column("website", String(2048)),
    Column("contact", String(80)),
    Column("amount_lost", Numeric(14, 2)),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)
Index("incident_reports_user_created_idx", incident_reports.c.user_id, incident_reports.c.created_at)


def create_database_engine(database_url: str | URL | None, fallback_path: str):
    if database_url:
        url = database_url
    else:
        path = Path(fallback_path).resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        url = URL.create("sqlite", database=str(path))

    if isinstance(url, str) and url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    connect_args = {"check_same_thread": False} if str(url).startswith("sqlite") else {}
    engine = create_engine(url, pool_pre_ping=True, connect_args=connect_args)
    if engine.dialect.name == "sqlite":
        @event.listens_for(engine, "connect")
        def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
    return engine


def get_db():
    if "db" not in g:
        engine = current_app.extensions["cybershield_db_engine"]
        g.db = engine.connect()
    return g.db


def close_db(_error: BaseException | None = None) -> None:
    connection = g.pop("db", None)
    if connection is not None:
        connection.close()


def init_db(engine=None) -> None:
    database_engine = engine or current_app.extensions["cybershield_db_engine"]
    metadata.create_all(database_engine)
