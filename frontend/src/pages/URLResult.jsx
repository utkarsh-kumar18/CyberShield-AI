import { useLocation, useNavigate } from "react-router-dom";

function URLResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const result = state?.result;
  const url = state?.url || result?.message || "";

  if (!result) {
    return (
      <main className="result-page">
        <section className="result-card">
          <h1>No scan result available</h1>
          <p>Run a URL scan to see its analysis here.</p>
          <button
            className="primary-btn"
            onClick={() => navigate("/url-scanner")}
          >
            Open URL Scanner
          </button>
        </section>
      </main>
    );
  }

  const risk = String(result.risk_level || "UNKNOWN").toUpperCase();
  const score = result.risk_score ?? result.security_score ?? result.score ?? 0;
  const finalResult = String(
    result.final_result || result.prediction || "UNKNOWN"
  ).toUpperCase();

  const threat = ["HIGH", "CRITICAL"].includes(risk);
  const caution = risk === "MEDIUM";

  const title =
    threat || finalResult === "SCAM / PHISHING"
      ? "Potential threat detected"
      : caution || finalResult === "SUSPICIOUS"
        ? "Use caution with this URL"
        : finalResult === "SAFE"
          ? "No strong threat signals found"
          : "URL analysis completed";

  const levelClass = threat || caution ? "danger" : "safe";

  const indicators = [
    ...new Set([
      ...(Array.isArray(result.detected_patterns)
        ? result.detected_patterns
        : []),
      ...(Array.isArray(result.findings) ? result.findings : []),
      ...(Array.isArray(result.detected_categories)
        ? result.detected_categories
        : []),
    ]),
  ];

  const urlAnalysis = result.signals?.url_analysis;
  const urls = Array.isArray(urlAnalysis?.urls)
    ? urlAnalysis.urls
    : [];

  const urlFindings = urls.flatMap((item) =>
    (Array.isArray(item.findings) ? item.findings : [])
  );

  const allIndicators = [...new Set([...indicators, ...urlFindings])];

  const intelligence =
    result.signals?.threat_intelligence?.status || "not available";

  const checksStatus = urlAnalysis?.status || "not available";

  return (
    <main className="result-page">
      <div className="result-header">
        <h1>URL Scan Result</h1>
        <p>Analysis from the CyberShield API.</p>
      </div>

      <section className="result-card">
        <div className={`result-status ${levelClass}`}>
          {threat ? "!" : caution ? "?" : "✓"}
        </div>

        <h2>{title}</h2>

        <p className="result-description">
          Risk level: <strong>{risk}</strong>
          {" · "}
          Risk score: <strong>{score}/100</strong>
        </p>

        <div className="scanned-url">
          <span>Scanned URL</span>
          <strong>{url}</strong>
        </div>

        <div className="result-details">
          <div>
            <span>Threat intelligence</span>
            <strong>{intelligence}</strong>
          </div>

          <div>
            <span>URL checks</span>
            <strong>
              {urls.length
                ? `${urls.length} checked`
                : checksStatus === "checked"
                  ? "Checked"
                  : "No checks returned"}
            </strong>
          </div>

          <div>
            <span>Model signal</span>
            <strong>
              {result.ml_prediction || "Not evaluated"}
            </strong>
          </div>
        </div>

        <div className="result-findings">
          <h3>Detected indicators</h3>

          {allIndicators.length > 0 ? (
            <ul>
              {allIndicators.map((indicator) => (
                <li key={indicator}>{indicator}</li>
              ))}
            </ul>
          ) : (
            <p>No indicators were returned by the configured checks.</p>
          )}
        </div>

        {intelligence === "not_configured" && (
          <p className="auth-note">
            External threat-intelligence checks are not configured.
            A low score does not guarantee that a website is safe.
          </p>
        )}

        <div className="result-actions">
          <button
            className="primary-btn"
            onClick={() => navigate("/url-scanner")}
          >
            Scan another URL
          </button>

          <button
            className="secondary-result-btn"
            onClick={() => navigate("/scan-history")}
          >
            View scan history
          </button>
        </div>

        <p className="auth-note">
          Automated analysis can be wrong. Do not visit a suspicious
          URL just because a scan reports low risk.
        </p>
      </section>
    </main>
  );
}

export default URLResult;