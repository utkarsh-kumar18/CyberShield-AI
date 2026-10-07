import { useLocation, useNavigate } from "react-router-dom";

function MessageResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.message || "Unknown message";

  return (
    <div className="message-result-page">

      <div className="message-result-header">
        <h1>Message Scan Result</h1>

        <p>
          Security analysis of the submitted message.
        </p>
      </div>

      <div className="message-result-card">

        <div className="message-result-status safe">
          ✓
        </div>

        <h2>Message Appears Safe</h2>

        <p className="message-result-description">
          No immediate scam or phishing threats were detected during this scan.
        </p>

        <div className="scanned-message">
          <span>Scanned Message</span>

          <p>{message}</p>
        </div>

        <div className="message-result-details">

          <div>
            <span>Scam Risk</span>
            <strong className="safe-text">Low</strong>
          </div>

          <div>
            <span>Phishing Risk</span>
            <strong className="safe-text">Low</strong>
          </div>

          <div>
            <span>Threat Level</span>
            <strong className="safe-text">Safe</strong>
          </div>

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

        <p className="demo-note">
          Demo result — real threat detection will be connected to the
          backend/AI later.
        </p>

      </div>

    </div>
  );
}

export default MessageResult;