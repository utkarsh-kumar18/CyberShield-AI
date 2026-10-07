import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MessageScanner() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    if (!message.trim()) return;

    setScanning(true);

    setTimeout(() => {
      setScanning(false);

      navigate("/message-result", {
        state: {
          message: message.trim(),
        },
      });
    }, 1500);
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

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the suspicious message here..."
        ></textarea>

        <button
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Scan Message"}
        </button>

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