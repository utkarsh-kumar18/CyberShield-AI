import { useLocation, useNavigate } from "react-router-dom";

function URLResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const url = location.state?.url || "Unknown URL";

  return (
    <div className="result-page">

      <div className="result-header">
        <h1>URL Scan Result</h1>
        <p>Security analysis of the submitted website.</p>
      </div>

      <div className="result-card">

        <div className="result-status safe">
          ✓
        </div>

        <h2>Website Appears Safe</h2>

        <p className="result-description">
          No immediate security threats were detected during this scan.
        </p>

        <div className="scanned-url">
          <span>Scanned URL</span>
          <strong>{url}</strong>
        </div>

        <div className="security-score">
  <div className="score-circle">
    <strong>92</strong>
    <span>/ 100</span>
  </div>

  <div>
    <h3>Security Score</h3>
    <p>This website has a low security risk.</p>
  </div>
</div>

        <div className="result-details">

  

  <div>
    <span>Phishing Risk</span>
    <strong className="safe-text">Low</strong>
  </div>

  <div>
    <span>Malware Risk</span>
    <strong className="safe-text">Low</strong>
  </div>

  <div>
    <span>Website Reputation</span>
    <strong className="safe-text">Good</strong>
  </div>

  <div>
    <span>HTTPS Security</span>
    <strong className="safe-text">Secure</strong>
  </div>

  <div>
    <span>Domain Status</span>
    <strong className="safe-text">Active</strong>
  </div>

</div>

        <div className="result-actions">

          <button
            className="primary-btn"
            onClick={() => navigate("/url-scanner",{ replace: true })}
          >
            Scan Another URL
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
          backend/API later.
        </p>

      </div>

    </div>
  );
}

export default URLResult;