import os
import joblib

from flask import Blueprint, request, jsonify
from extensions import db
from models.scan import Scan
from flask_jwt_extended import jwt_required, get_jwt_identity


message_scanner = Blueprint(
    "message_scanner",
    __name__
)


# Find the trained model
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "scam_model.pkl"
)


# Load model
model = joblib.load(MODEL_PATH)


@message_scanner.route(
    "/message",
    methods=["POST"]
)
@jwt_required()
def scan_message():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data received."
        }), 400

    message = data.get(
        "message",
        ""
    ).strip()

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message is required."
        }), 400

    # AI prediction
    prediction = model.predict(
        [message]
    )[0]

    # Prediction probability
    probabilities = model.predict_proba(
        [message]
    )[0]

    confidence = max(
        probabilities
    ) * 100

    if prediction == "scam":

        status = "scam"

        result_message = (
            "This message shows patterns "
            "associated with scam messages."
        )

    else:

        status = "safe"

        result_message = (
            "No strong scam pattern was detected "
            "by the current AI model."
        )

    user_id = get_jwt_identity()

    scan = Scan(
        user_id=user_id,
        scan_type="message",
        target=message,
        result=status
    )

    db.session.add(scan)
    db.session.commit()

    return jsonify({
        "status": status,
        "message": message,
        "prediction": prediction,
        "confidence": round(
            confidence,
            2
        ),
        "result": result_message
    }), 200