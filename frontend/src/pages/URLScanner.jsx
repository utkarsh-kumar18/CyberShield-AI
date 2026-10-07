import { useState } from "react";
import { useNavigate } from "react-router-dom";

function URLScanner() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    if (!url.trim()) return;

    setScanning(true);

    setTimeout(() => {
      setScanning(false);
     navigate("/url-result", {
      state: {
        url: url.trim(),
      },
    });
  }, 1500);
};

  return (
    <div className="scanner-page">

      <div className="scanner-header">
        <h1>URL Security Scanner</h1>

        <p>
          Check a website for phishing, malware and other cyber threats.
        </p>
      </div>

      <div className="url-scanner-card">

        <div className="url-icon">
          🔗
        </div>

        <h2>Scan a Website</h2>

        <p>
          Enter the URL you want to check. Our security system will analyze
          the website for potential threats.
        </p>

        <div className="url-input-container">

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <button
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? "Scanning..." : "Scan URL"}
          </button>

        </div>

        <div className="scanner-info">

          <span>🛡️ AI Threat Detection</span>

          <span>🔍 Phishing Detection</span>

          <span>🌐 Website Reputation</span>

        </div>

      </div>

    </div>
  );
}

export default URLScanner;