import os
import re
import joblib

from flask import Blueprint, request, jsonify
from extensions import db
from models.scan import Scan
from flask_jwt_extended import jwt_required, get_jwt_identity


message_scanner = Blueprint(
    "message_scanner",
    __name__
)


# --------------------------------------------------
# Load trained ML model
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "scam_model.pkl"
)

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Scam indicator detection
# --------------------------------------------------

def detect_scam_indicators(message):

    text = message.lower()

    score = 0
    indicators = []

    # ----------------------------------------------
    # 1. Suspicious / shortened URLs
    # ----------------------------------------------

    url_patterns = [
        r"https?://",
        r"www\.",
        r"bit\.ly",
        r"tinyurl\.com",
        r"t\.co/",
        r"goo\.gl",
        r"cutt\.ly",
        r"is\.gd",
        r"shorturl\.at"
    ]

    if any(re.search(pattern, text) for pattern in url_patterns):
        score += 25
        indicators.append("Suspicious or shortened link detected")


    # ----------------------------------------------
    # 2. Urgency / pressure language
    # ----------------------------------------------

    urgency_patterns = [
        r"urgent",
        r"immediately",
        r"act now",
        r"within \d+",
        r"last chance",
        r"expires",
        r"blocked",
        r"suspended",
        r"will be blocked",
        r"cancel immediately",
        r"verify immediately"
    ]

    urgency_found = any(
        re.search(pattern, text)
        for pattern in urgency_patterns
    )

    if urgency_found:
        score += 20
        indicators.append("Urgency or pressure language detected")


    # ----------------------------------------------
    # 3. Banking / financial activity
    # ----------------------------------------------

    financial_patterns = [
        r"bank",
        r"transaction",
        r"payment",
        r"upi",
        r"account",
        r"credit",
        r"debit",
        r"refund",
        r"transfer",
        r"rs\.?",
        r"₹",
        r"money"
    ]

    financial_found = any(
        re.search(pattern, text)
        for pattern in financial_patterns
    )

    if financial_found:
        score += 20
        indicators.append("Financial or banking language detected")


    # ----------------------------------------------
    # 4. Credential / OTP requests
    # ----------------------------------------------

    credential_patterns = [
        r"otp",
        r"pin",
        r"password",
        r"cvv",
        r"card number",
        r"account details",
        r"login details",
        r"verify your account",
        r"verify account",
        r"share.*otp",
        r"enter.*otp"
    ]

    credential_found = any(
        re.search(pattern, text)
        for pattern in credential_patterns
    )

    if credential_found:
        score += 30
        indicators.append("Credential or sensitive information request detected")


    # ----------------------------------------------
    # 5. Reward / prize / fake offer
    # ----------------------------------------------

    reward_patterns = [
        r"you won",
        r"winner",
        r"prize",
        r"reward",
        r"lottery",
        r"cashback",
        r"claim your",
        r"free gift",
        r"lucky"
    ]

    reward_found = any(
        re.search(pattern, text)
        for pattern in reward_patterns
    )

    if reward_found:
        score += 25
        indicators.append("Possible reward or prize scam detected")


    # ----------------------------------------------
    # 6. Threat / account warning
    # ----------------------------------------------

    threat_patterns = [
        r"account.*blocked",
        r"account.*suspended",
        r"account.*deactivated",
        r"legal action",
        r"police",
        r"penalty",
        r"fine",
        r"security alert",
        r"unauthorized transaction"
    ]

    threat_found = any(
        re.search(pattern, text)
        for pattern in threat_patterns
    )

    if threat_found:
        score += 25
        indicators.append("Threat or account-warning language detected")


    # Maximum score = 100
    score = min(score, 100)

    return score, indicators


# --------------------------------------------------
# Message Scanner API
# --------------------------------------------------

@message_scanner.route(
    "/message",
    methods=["POST"]
)
@jwt_required()
def scan_message():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data received."
        }), 400


    message = data.get(
        "message",
        ""
    ).strip()

    if len(message) > 5000:
        return jsonify({
            "status": "error",
            "message": "Message must not exceed 5000 characters."
        }), 400


    try:

        # ------------------------------------------
        # AI prediction
        # ------------------------------------------

        prediction = model.predict(
            [message]
        )[0]

        probabilities = model.predict_proba(
            [message]
        )[0]

        model_confidence = max(
            probabilities
        ) * 100


        # ------------------------------------------
        # Scam indicator analysis
        # ------------------------------------------

        indicator_score, indicators = detect_scam_indicators(
            message
        )


        # ------------------------------------------
        # Combine AI + security indicators
        # ------------------------------------------

        scam_probability = 0

        for index, class_name in enumerate(
            model.classes_
        ):

            if str(class_name).lower() == "scam":
                scam_probability = (
                    probabilities[index] * 100
                )


        # Hybrid risk score
        risk_score = (
            scam_probability * 0.60
            +
            indicator_score * 0.40
        )


        # Strong security indicators should not
        # be ignored even if ML model says safe.

        if indicator_score >= 60:
            status = "scam"

        elif risk_score >= 55:
            status = "scam"

        elif risk_score >= 35:
            status = "suspicious"

        else:
            status = "safe"


        # ------------------------------------------
        # Result message
        # ------------------------------------------

        if status == "scam":

            result_message = (
                "This message shows multiple indicators "
                "associated with scam or phishing activity."
            )

        elif status == "suspicious":

            result_message = (
                "This message contains suspicious patterns "
                "that should be verified before taking action."
            )

        else:

            result_message = (
                "No significant scam indicators were detected."
            )


        # ------------------------------------------
        # Save scan history
        # ------------------------------------------

        user_id = get_jwt_identity()

        scan = Scan(
            user_id=user_id,
            scan_type="message",
            target=message,
            result=status
        )

        db.session.add(scan)
        db.session.commit()


        # ------------------------------------------
        # Return result
        # ------------------------------------------

        return jsonify({

            "status": status,

            "message": message,

            "prediction": prediction,

            "confidence": round(
                model_confidence,
                2
            ),

            "risk_score": round(
                risk_score,
                2
            ),

            "indicators": indicators,

            "result": result_message

        }), 200


    except Exception as error:
        db.session.rollback()

        print("Message scanner error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to analyze message."
        }), 500