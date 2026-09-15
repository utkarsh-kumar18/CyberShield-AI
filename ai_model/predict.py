import joblib
from security_rules import security_check

model = joblib.load("model.pkl")

while True:

    message = input("\nEnter a message (or type 'exit'): ")

    if message.lower() == "exit":
        break

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

    print("\n========== CyberShield AI ==========")

    print("ML Prediction:", ml_result)
    print(f"ML Confidence: {ml_confidence:.2f}%")

    print("Security Score:", security_score)
    print("Risk Level:", risk_level)

    if patterns:
        print("Detected Patterns:", ", ".join(patterns))
    else:
        print("Detected Patterns: None")

    print("------------------------------------")
    print("Final Result:", final_result)
    print("====================================")