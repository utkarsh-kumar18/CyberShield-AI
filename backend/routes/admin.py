from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.fraud_report import FraudReport
from models.scan import Scan

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

    try:

        data = request.get_json()

        new_status = data.get("status")

        allowed_statuses = [
            "pending",
            "investigating",
            "resolved"
        ]

        if new_status not in allowed_statuses:
            return jsonify({
                "status": "error",
                "message": "Invalid status."
            }), 400

        report = FraudReport.query.get(report_id)

        if not report:
            return jsonify({
                "status": "error",
                "message": "Report not found."
            }), 404

        report.status = new_status

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Report status updated successfully.",
            "report_id": report.id,
            "new_status": report.status
        }), 200

    except Exception as error:

        db.session.rollback()

        print("Update report status error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to update report status."
        }), 500

@admin.route("/scans", methods=["GET"])
@jwt_required()
def get_scans():

    if not admin_required():
        return jsonify({
            "status": "error",
            "message": "Admin access required."
        }), 403

    try:
        scans = Scan.query.order_by(
            Scan.created_at.desc()
        ).all()

        scan_list = []

        for scan in scans:

            user = User.query.get(scan.user_id)

            scan_list.append({
                "id": scan.id,
                "user_id": scan.user_id,
                "user_name": user.name if user else "Unknown User",
                "user_email": user.email if user else "Unknown",
                "scan_type": scan.scan_type,
                "target": scan.target,
                "result": scan.result,
                "created_at": scan.created_at.isoformat()
                    if scan.created_at else None
            })

        return jsonify({
            "status": "success",
            "count": len(scan_list),
            "scans": scan_list
        }), 200

    except Exception as error:
        print("Admin scans error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to load scans."
        }), 500