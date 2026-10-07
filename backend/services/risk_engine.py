"""Combine independent detector scores into a single explainable risk level."""


def calculate_risk(
    *,
    spam_probability: float,
    rule_score: int,
    url_score: int,
    threat_intel: list[dict],
    has_urls: bool,
    model_available: bool = True,
) -> dict[str, object]:
    signals: list[tuple[float, float]] = [(float(rule_score), 0.35)]
    if model_available:
        signals.append((spam_probability * 100, 0.35))
    if has_urls:
        signals.append((float(url_score), 0.15))

    configured_intel = [item for item in threat_intel if item.get("status") in {"clean", "malicious", "suspicious"}]
    if configured_intel:
        intel_score = max(
            100.0 if item["status"] == "malicious" else 60.0 if item["status"] == "suspicious" else 0.0
            for item in configured_intel
        )
        signals.append((intel_score, 0.15))

    weight_total = sum(weight for _, weight in signals)
    weighted_score = sum(value * weight for value, weight in signals) / weight_total
    # Preserve a strong detector signal so averaging cannot wash out a
    # confirmed rule or threat-intelligence match.
    strongest_signal = max(value for value, _ in signals)
    score = round(max(weighted_score, strongest_signal * 0.75))
    level = "CRITICAL" if score >= 75 else "HIGH" if score >= 50 else "MEDIUM" if score >= 25 else "LOW"
    result = "SCAM / PHISHING" if level in {"HIGH", "CRITICAL"} else "SUSPICIOUS" if level == "MEDIUM" else "SAFE"
    return {"score": score, "level": level, "result": result}
