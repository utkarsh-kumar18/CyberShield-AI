"""End-to-end message, URL, language, threat-intel, and risk analysis."""

from pathlib import Path
from typing import Any

import joblib
import sklearn

from ai_model.security_rules import detect_categories, security_check
from backend.services.language import detect_language
from backend.services.risk_engine import calculate_risk
from backend.services.threat_intel import check_url_threat_intel
from backend.services.url_analysis import analyze_urls, extract_urls


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ai_model" / "model.pkl"
MODEL_SKLEARN_VERSION = "1.8.0"


def model_version_compatible() -> bool:
    return sklearn.__version__ == MODEL_SKLEARN_VERSION


def load_model() -> Any:
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"AI model not found at {MODEL_PATH}. Train it with `python ai_model/train_model.py`."
        )
    loaded_model = joblib.load(MODEL_PATH)
    # Keep the bundled 1.8 artifact usable in Python 3.10 development environments;
    # production images use the matching 1.8 release on Python 3.11+.
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


def analyze_url_content(url: str) -> dict[str, Any]:
    """Analyze one URL without applying the SMS-trained text classifier to it."""
    url_result = analyze_urls([url])["urls"][0]
    intel_results = check_url_threat_intel(url)
    flagged_intel = [item for item in intel_results if item["status"] in {"malicious", "suspicious"}]
    patterns = list(url_result["findings"])
    categories: list[str] = []
    if flagged_intel:
        patterns.append("URL flagged by threat intelligence")
        categories.append("MALICIOUS_URL")

    risk = calculate_risk(
        spam_probability=0.0,
        rule_score=0,
        url_score=int(url_result["score"]),
        threat_intel=intel_results,
        has_urls=True,
        model_available=False,
    )
    risk_score = max(int(risk["score"]), int(url_result["score"]))
    risk_level = "CRITICAL" if risk_score >= 75 else "HIGH" if risk_score >= 50 else "MEDIUM" if risk_score >= 25 else "LOW"
    risk_result = "SCAM / PHISHING" if risk_level in {"HIGH", "CRITICAL"} else "SUSPICIOUS" if risk_level == "MEDIUM" else "SAFE"
    intel_status = (
        "checked" if any(item["status"] in {"clean", "malicious", "suspicious"} for item in intel_results)
        else "unavailable" if any(item["status"] == "lookup_error" for item in intel_results)
        else "not_configured"
    )
    result = {
        "prediction": risk_result,
        "final_result": risk_result,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "message": url,
        "ml_prediction": "NOT_USED_FOR_URLS",
        "ml_confidence": None,
        "security_score": url_result["score"],
        "detected_patterns": patterns,
        "detected_categories": categories,
        "score": url_result["score"],
        "findings": url_result["findings"],
        "host": url_result["host"],
        "signals": {
            "language_detection": {"code": "not_applicable", "name": "URL-only analysis", "ml_model_coverage": "Not used for URLs"},
            "ml_nlp": {"prediction": "NOT_USED_FOR_URLS", "confidence": None, "spam_probability": None},
            "rule_engine": {"score": url_result["score"], "level": "HIGH" if url_result["score"] >= 50 else "MEDIUM" if url_result["score"] >= 25 else "LOW", "findings": url_result["findings"], "categories": categories},
            "url_analysis": {"urls": [url_result], "score": url_result["score"], "status": "checked"},
            "threat_intelligence": {"status": intel_status, "results": intel_results},
        },
    }
    return result
