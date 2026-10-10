import { useLocation, useNavigate } from "react-router-dom";

function URLResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const url = state?.url || result?.message || "";

  if (!result) {
    return <main className="result-page"><section className="result-card">
      <h1>No scan result available</h1>
      <p>Run a URL scan to see its analysis here.</p>
      <button className="primary-btn" onClick={() => navigate("/url-scanner")}>Open URL Scanner</button>
    </section></main>;
  }

  const risk = result.risk_level || "UNKNOWN";
  const threat = ["HIGH", "CRITICAL"].includes(risk);
  const caution = risk === "MEDIUM";
  const title = threat ? "Potentially unsafe URL" : caution ? "Use caution with this URL" : "No strong threat signals found";
  const levelClass = threat || caution ? "danger" : "safe";
  const indicators = result.detected_patterns || [];
  const urls = result.signals?.url_analysis?.urls || [];
  const intelligence = result.signals?.threat_intelligence?.status || "not available";

  return (
    <main className="result-page">
      <div className="result-header"><h1>URL Scan Result</h1><p>Analysis from the CyberShield API.</p></div>
      <section className="result-card">
        <div className={`result-status ${levelClass}`}>{threat ? "!" : caution ? "?" : "✓"}</div>
        <h2>{title}</h2>
        <p className="result-description">Risk level: <strong>{risk}</strong> · Risk score: <strong>{result.risk_score ?? "—"}/100</strong></p>
        <div className="scanned-url"><span>Scanned URL</span><strong>{url}</strong></div>
        <div className="result-details">
          <div><span>Threat intelligence</span><strong>{intelligence}</strong></div>
          <div><span>URL checks</span><strong>{urls.length ? `${urls.length} checked` : "No URL checks returned"}</strong></div>
          <div><span>Model signal</span><strong>{result.ml_prediction || "Not evaluated"}</strong></div>
        </div>
        <div className="result-findings"><h3>Detected indicators</h3>
          {indicators.length ? <ul>{indicators.map((indicator) => <li key={indicator}>{indicator}</li>)}</ul> : <p>No indicators were returned by the configured checks.</p>}
          {urls.map((item) => item.findings?.map((finding) => <p key={`${item.url}-${finding}`}>{item.host}: {finding}</p>))}
        </div>
        <div className="result-actions">
          <button className="primary-btn" onClick={() => navigate("/url-scanner")}>Scan another URL</button>
          <button className="secondary-result-btn" onClick={() => navigate("/scan-history")}>View scan history</button>
        </div>
        <p className="auth-note">Automated analysis can be wrong. Do not visit a suspicious URL just because a scan reports low risk.</p>
      </section>
    </main>
  );
}

export default URLResult;
