from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from ai_model.security_rules import security_check

app = FastAPI(
    title="CyberShield AI",
    description="AI-powered scam and phishing detection API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

BASE_DIR = Path(__file__).resolve().parent
model = joblib.load(BASE_DIR / "model.pkl")

class MessageRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {
        "message": "CyberShield AI is running"
    }

@app.post("/predict")
def predict(request: MessageRequest):

    message = request.message

    prediction = model.predict([message])[0]
    probabilities = model.predict_proba([message])[0]

    ml_confidence = probabilities[prediction] * 100

    if prediction == 1:
        ml_result = "SPAM"
    else:
        ml_result = "SAFE"

    security_score, risk_level, patterns = security_check(message)

    if prediction == 1 and security_score >= 30:
        final_result = "SCAM / PHISHING"

    elif prediction == 1:
        final_result = "SUSPICIOUS"

    elif security_score >= 60:
        final_result = "SCAM / PHISHING"

    elif security_score >= 30:
        final_result = "SUSPICIOUS"

    else:
        final_result = "SAFE"

    if final_result == "SCAM / PHISHING":
        risk_level = "HIGH"
    elif final_result == "SUSPICIOUS":
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "message": message,
        "ml_prediction": ml_result,
        "ml_confidence": round(ml_confidence, 2),
        "security_score": security_score,
        "risk_level": risk_level,
        "detected_patterns": patterns,
        "final_result": final_result
    }