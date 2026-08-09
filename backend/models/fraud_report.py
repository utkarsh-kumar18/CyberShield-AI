from extensions import db
from datetime import datetime


class FraudReport(db.Model):

    __tablename__ = "fraud_reports"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    fraud_type = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    suspicious_url = db.Column(
        db.String(500)
    )

    status = db.Column(
        db.String(30),
        default="pending"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )