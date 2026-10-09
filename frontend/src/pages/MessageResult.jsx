
import { useLocation, useNavigate } from "react-router-dom";

function MessageResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.message || "";
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="message-result-page">
        <h1>No scan result available</h1>
        <p>Please scan a message first.</p>
        <button onClick={() => navigate("/message-scanner")}>
          Open Message Scanner
        </button>
      </div>
    );
  }

  const finalResult = result.final_result || "UNKNOWN";
  const isSafe = finalResult === "SAFE";

  const title =
    finalResult === "SAFE"
      ? "Message Appears Safe"
      : finalResult === "SUSPICIOUS"
        ? "Suspicious Message Detected"
        : finalResult === "SCAM / PHISHING"
          ? "Scam / Phishing Detected"
          : "Scan Result";

  const riskColor =
    finalResult === "SAFE"
      ? "#16a34a"
      : finalResult === "SUSPICIOUS"
        ? "#d97706"
        : "#dc2626";

  return (
    <div className="message-result-page">
      <div className="message-result-header">
        <h1>Message Scan Result</h1>
        <p>Security analysis of the submitted message.</p>
      </div>

      <div className="message-result-card">
        <div
          className={`message-result-status ${isSafe ? "safe" : "unsafe"}`}
          style={{ color: riskColor }}
        >
          {isSafe ? "✓" : "!"}
        </div>

        <h2>{title}</h2>

        <p className="message-result-description">
          ML Prediction: {result.ml_prediction}
        </p>

        <div className="scanned-message">
          <span>Scanned Message</span>
          <p>{message}</p>
        </div>

        <div className="message-result-details">
          <div>
            <span>Security Risk</span>
            <strong style={{ color: riskColor }}>
              {result.risk_level}
            </strong>
          </div>

          <div>
            <span>Security Score</span>
            <strong>{result.security_score}</strong>
          </div>

          <div>
            <span>ML Confidence</span>
            <strong>{result.ml_confidence}%</strong>
          </div>
        </div>

        <div className="scanned-message">
          <span>Detected Patterns</span>
          <p>
            {result.detected_patterns?.length
              ? result.detected_patterns.join(", ")
              : "No suspicious patterns detected"}
          </p>
        </div>

        <div className="message-result-actions">
          <button
            className="primary-btn"
            onClick={() => navigate("/message-scanner")}
          >
            Scan Another Message
          </button>

          <button
            className="secondary-result-btn"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageResult;
