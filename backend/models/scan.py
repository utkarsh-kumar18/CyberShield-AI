from datetime import datetime
from extensions import db


class Scan(db.Model):

    __tablename__ = "scans"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    scan_type = db.Column(
        db.String(30),
        nullable=False
    )

    target = db.Column(
        db.Text,
        nullable=False
    )

    result = db.Column(
        db.String(100),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )