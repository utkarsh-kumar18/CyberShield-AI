from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.fraud_report import FraudReport

admin = Blueprint(
    "admin",
    __name__
)

def admin_required():
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return False
    user = User.query.get(user_id)
    if not user:
        return False
    return user.role == "admin"

@admin.route(
    "/reports",
    methods=["GET"]
)
@jwt_required()
def get_reports():

    if not admin_required():
        return jsonify({
            "status": "error",
            "message": "Admin access required."
        }), 403

    try:

        reports = FraudReport.query.order_by(
            FraudReport.created_at.desc()
        ).all()

        result = []

        for report in reports:

            result.append({
                "id": report.id,
                "user_id": report.user_id,
                "fraud_type": report.fraud_type,
                "description": report.description,
                "amount": float(report.amount or 0),
                "suspicious_url": report.suspicious_url,
                "status": report.status,
                "created_at": report.created_at.isoformat() + "Z"
                    if report.created_at
                    else None
            })

        return jsonify({
            "status": "success",
            "reports": result
        }), 200

    except Exception as error:

        print("Admin reports error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to load reports."
        }), 500
    
@admin.route(
    "/reports/<int:report_id>",
    methods=["PUT"]
)
@jwt_required()
def update_report_status(report_id):

    if not admin_required():
        return jsonify({
            "status": "error",
            "message": "Admin access required."
        }), 403