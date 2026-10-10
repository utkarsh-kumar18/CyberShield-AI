import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanUrl } from "../lib/api";
import { useAuth } from "../auth/useAuth";

function URLScanner() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const handleScan = async (event) => {
  event.preventDefault();
  setError("");

  if (!url.trim()) {
    setError("Please enter a website URL.");
    return;
  }

  try {
    const parsed = new URL(url.trim().startsWith("www.") ? `https://${url.trim()}` : url.trim());
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) throw new Error("Unsupported URL");
  } catch {
    setError("Please enter a valid URL, such as https://example.com");
    return;
  }

  setScanning(true);
  try {
    const normalizedUrl = url.trim().startsWith("www.") ? `https://${url.trim()}` : url.trim();
    const response = await scanUrl(normalizedUrl, token);
    const result = response.result || response;
    navigate("/url-result", {
      state: {
        url: normalizedUrl,
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

        <form onSubmit={handleScan}>
        <div className="url-input-container">

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            maxLength={2048}
            required
          />

          <button
            type="submit"
            disabled={scanning}
          >
            {scanning ? "Scanning..." : "Scan URL"}
          </button>

        </div>
        {error && (
          <p className="scanner-error">
           {error}
         </p>
)}
        {!token && <p className="auth-note">Sign in to save this scan to your history.</p>}
        </form>

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
