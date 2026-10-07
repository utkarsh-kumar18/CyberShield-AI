"""End-to-end message, URL, language, threat-intel, and risk analysis."""

from pathlib import Path
from typing import Any

import joblib

from ai_model.security_rules import detect_categories, security_check
from backend.services.language import detect_language
from backend.services.risk_engine import calculate_risk
from backend.services.threat_intel import check_url_threat_intel
from backend.services.url_analysis import analyze_urls, extract_urls


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ai_model" / "model.pkl"


def load_model() -> Any:
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"AI model not found at {MODEL_PATH}. Train it with `python ai_model/train_model.py`."
        )
    loaded_model = joblib.load(MODEL_PATH)
    # The bundled artifact was produced by sklearn 1.8; this restores an
    # attribute sklearn 1.7 expects when computing predict_proba.
    classifier = getattr(loaded_model, "named_steps", {}).get("classifier")
    if classifier is not None and not hasattr(classifier, "multi_class"):
        classifier.multi_class = "auto"
    return loaded_model


def _predict(model: Any, message: str) -> tuple[str, float, float]:
    prediction = model.predict([message])[0]
    probabilities = model.predict_proba([message])[0]
    classes = list(model.classes_)
    spam_index = next((i for i, value in enumerate(classes) if str(value).lower() in {"1", "spam", "scam"}), None)
    if spam_index is None:
        raise ValueError("The loaded classifier does not contain a spam class.")
    spam_probability = float(probabilities[spam_index])
    predicted_confidence = float(probabilities[classes.index(prediction)])
    return ("SPAM" if str(prediction).lower() in {"1", "spam", "scam"} else "SAFE", predicted_confidence, spam_probability)


def analyze_content(message: str, model: Any) -> dict[str, Any]:
    cleaned = message.strip()
    if not cleaned:
        raise ValueError("Provide message text or at least one URL to analyze.")

    language = detect_language(cleaned)
    model_supported = language["code"] == "en"
    if model_supported:
        ml_prediction, ml_confidence, spam_probability = _predict(model, cleaned)
    else:
        ml_prediction, ml_confidence, spam_probability = "OUT_OF_SCOPE", None, 0.0
    rule_score, rule_level, patterns = security_check(cleaned)
    categories = detect_categories(cleaned, patterns)
    urls = extract_urls(cleaned)
    url_analysis = analyze_urls(urls)
    intel_results = [
        {"url": url, **result}
        for url in urls[:3]
        for result in check_url_threat_intel(url)
    ]
    flagged_intel = [item for item in intel_results if item["status"] in {"malicious", "suspicious"}]
    if flagged_intel:
        patterns.append("URL flagged by threat intelligence")
        categories.append("MALICIOUS_URL")
    risk = calculate_risk(
        spam_probability=spam_probability,
        rule_score=rule_score,
        url_score=int(url_analysis["score"]),
        threat_intel=intel_results,
        has_urls=bool(urls),
        model_available=model_supported,
    )

    language["ml_model_coverage"] = "English SMS" if model_supported else "Not trained for this language"
    language["rule_coverage"] = "English and partial Hindi/Hinglish indicators"

    intel_status = (
        "checked" if any(item["status"] in {"clean", "malicious", "suspicious"} for item in intel_results)
        else "unavailable" if intel_results and any(item["status"] == "lookup_error" for item in intel_results)
        else "not_configured"
    )
    signals = {
        "language_detection": language,
        "ml_nlp": {
            "prediction": ml_prediction,
            "confidence": round(ml_confidence * 100, 2) if ml_confidence is not None else None,
            "spam_probability": round(spam_probability * 100, 2) if model_supported else None,
        },
        "rule_engine": {"score": rule_score, "level": rule_level, "findings": patterns, "categories": categories},
        "url_analysis": url_analysis,
        "threat_intelligence": {"status": intel_status, "results": intel_results},
    }
    return {
        "prediction": risk["result"],
        "final_result": risk["result"],
        "risk_score": risk["score"],
        "risk_level": risk["level"],
        "message": cleaned,
        "ml_prediction": ml_prediction,
        "ml_confidence": round(ml_confidence * 100, 2) if ml_confidence is not None else None,
        "security_score": rule_score,
        "detected_patterns": patterns,
        "detected_categories": categories,
        "signals": signals,
    }
