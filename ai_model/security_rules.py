import re

RISK_PATTERNS = {
    "bank": 15,
    "account blocked": 25,
    "verify your account": 25,
    "verify account": 20,
    "kyc": 20,
    "otp": 20,
    "password": 15,
    "credit card": 15,
    "debit card": 15,
    "click here": 15,
    "urgent": 10,
    "immediately": 10,
    "prize": 10,
    "winner": 10,
    "won": 10,
}

def security_check(message):

    message = message.lower()

    score = 0
    detected_patterns = []

    for pattern, points in RISK_PATTERNS.items():

        if pattern in message:
            score += points
            detected_patterns.append(pattern)

    url_pattern = r"https?://\S+|www\.\S+"

    if re.search(url_pattern, message):
        score += 30
        detected_patterns.append("suspicious URL")

    score = min(score, 100)

    if score >= 60:
        risk = "HIGH"

    elif score >= 30:
        risk = "MEDIUM"

    else:
        risk = "LOW"

    return score, risk, detected_patterns