import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanMessage } from "../lib/api";
import { useAuth } from "../auth/useAuth";

function MessageScanner() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const handleScan = async (event) => {
    event.preventDefault();
    setError("");
    if (!message.trim()) return;

    setScanning(true);
    try {
      const response = await scanMessage(message.trim(), token);
      const result = response.result || response;
      navigate("/message-result", {
        state: {
          message: message.trim(),
          result,
          reportId: response.report_id,
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="message-scanner-page">

      <div className="message-scanner-header">
        <h1>Message Security Scanner</h1>

        <p>
          Check a suspicious message for scams, phishing and fraud attempts.
        </p>
      </div>

      <div className="message-scanner-card">

        <div className="message-icon">
          💬
        </div>

        <h2>Scan a Message</h2>

        <p>
          Paste the suspicious message below. Our security system will
          analyze it for potential scam and phishing patterns.
        </p>

        <form onSubmit={handleScan}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the suspicious message here..."
            maxLength={10000}
            required
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={scanning || !message.trim()}>
            {scanning ? "Analyzing..." : "Scan Message"}
          </button>
        </form>

        {!token && <p className="auth-note">Sign in to save this scan to your history.</p>}

        <div className="message-scanner-info">

          <span>🛡️ AI Threat Detection</span>

          <span>⚠️ Scam Detection</span>

          <span>🔍 Phishing Detection</span>

        </div>

      </div>

    </div>
  );
}

export default MessageScanner;
