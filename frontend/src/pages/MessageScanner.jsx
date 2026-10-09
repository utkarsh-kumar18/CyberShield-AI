
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MessageScanner() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!message.trim() || scanning) return;

    setScanning(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      navigate("/message-result", {
        state: {
          message: message.trim(),
          result,
        },
      });
    } catch (err) {
      setError(
        "Unable to scan the message. Check that the AI API is running and try again."
      );
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
        <div className="message-icon">💬</div>

        <h2>Scan a Message</h2>

        <p>
          Paste the suspicious message below. Our security system will
          analyze it for potential scam and phishing patterns.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the suspicious message here..."
          disabled={scanning}
        />

        <button onClick={handleScan} disabled={scanning || !message.trim()}>
          {scanning ? "Scanning..." : "Scan Message"}
        </button>

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

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
