from flask import Blueprint, request, jsonify
from extensions import db
from models.fraud_report import FraudReport
from flask_jwt_extended import jwt_required, get_jwt_identity


fraud_reports = Blueprint(
    "fraud_reports",
    __name__
)


@fraud_reports.route(
    "/report",
    methods=["POST"]
)
@jwt_required()
def create_report():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data received."
        }), 400

    user_id = get_jwt_identity()

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "message": "Invalid user identity."
        }), 401

    fraud_type = data.get("fraud_type", "").strip()
    description = data.get("description", "").strip()
    amount = data.get("amount", 0)
    suspicious_url = data.get(
        "suspicious_url",
        ""
    ).strip()

    if not fraud_type:
        return jsonify({
            "status": "error",
            "message": "Fraud type is required."
        }), 400

    if not description:
        return jsonify({
            "status": "error",
            "message": "Description is required."
        }), 400

    try:

        report = FraudReport(

            user_id=user_id,

            fraud_type=fraud_type,

            description=description,

            amount=amount,

            suspicious_url=suspicious_url
        )

        db.session.add(report)

        db.session.commit()

        return jsonify({

            "status": "success",

            "message": "Fraud report submitted successfully.",

            "report_id": report.id

        }), 201

    except Exception as error:

        db.session.rollback()

        print("Fraud report error:", error)

        return jsonify({

            "status": "error",

            "message": "Unable to submit fraud report."

        }), 500

@fraud_reports.route(
    "/my-reports",
    methods=["GET"]
)
@jwt_required()
def get_my_reports():

    try:

        user_id = get_jwt_identity()

        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid user identity."
            }), 401

        reports = FraudReport.query.filter_by(
            user_id=user_id
        ).order_by(
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
                "created_at":
                    report.created_at.isoformat()
                    if report.created_at
                    else None
            })

        return jsonify({
            "status": "success",
            "reports": result
        }), 200

    except Exception as error:

        print("My reports error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to load your reports."
        }), 500