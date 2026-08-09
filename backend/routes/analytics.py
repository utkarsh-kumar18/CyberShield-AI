from flask import Blueprint, jsonify
from sqlalchemy import func

from extensions import db
from models.fraud_report import FraudReport


analytics = Blueprint(
    "analytics",
    __name__
)


@analytics.route("/stats", methods=["GET"])
def get_stats():

    try:

        # Total reports
        total_reports = db.session.query(
            func.count(FraudReport.id)
        ).scalar() or 0

        # Pending reports
        pending_reports = db.session.query(
            func.count(FraudReport.id)
        ).filter(
            FraudReport.status == "pending"
        ).scalar() or 0

        # Total amount
        total_amount = db.session.query(
            func.coalesce(
                func.sum(FraudReport.amount),
                0
            )
        ).scalar() or 0

        # Fraud types
        type_results = db.session.query(
            FraudReport.fraud_type,
            func.count(FraudReport.id)
        ).group_by(
            FraudReport.fraud_type
        ).all()

        fraud_types = {}

        for fraud_type, count in type_results:
            fraud_types[fraud_type] = count

        # Recent reports
        recent_reports = FraudReport.query.order_by(
            FraudReport.created_at.desc()
        ).limit(10).all()

        reports = []

        for report in recent_reports:

            reports.append({
                "id": report.id,
                "fraud_type": report.fraud_type,
                "description": report.description,
                "amount": float(report.amount or 0),
                "status": report.status,
                "created_at": (
                    report.created_at.isoformat()
                    if report.created_at
                    else None
                )
            })

        resolved_reports = FraudReport.query.filter_by(
            status="resolved"
        ).count()

        return jsonify({

            "status": "success",

            "total_reports": total_reports,

            "pending_reports": pending_reports,

            "resolved_reports": resolved_reports,

            "total_amount": float(total_amount),

            "fraud_types": fraud_types,

            "recent_reports": reports

        }), 200

    except Exception as error:

        print("Analytics error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to load analytics."
        }), 500