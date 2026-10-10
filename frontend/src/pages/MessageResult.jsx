import { useLocation, useNavigate } from "react-router-dom";

function MessageResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const message = state?.message || result?.message || "";

  if (!result) {
    return <main className="message-result-page"><section className="message-result-card">
      <h1>No scan result available</h1>
      <p>Run a message scan to see its analysis here.</p>
      <button className="primary-btn" onClick={() => navigate("/message-scanner")}>Open Message Scanner</button>
    </section></main>;
  }

  const risk = result.risk_level || "UNKNOWN";
  const threat = ["HIGH", "CRITICAL"].includes(risk);
  const caution = risk === "MEDIUM";
  const title = threat ? "Potential threat detected" : caution ? "Review this message carefully" : "No strong threat signals found";
  const levelClass = threat || caution ? "danger" : "safe";
  const language = result.signals?.language_detection?.name || "Not available";
  const confidence = result.ml_confidence == null ? "Not evaluated for this language" : `${result.ml_confidence}%`;
  const patterns = result.detected_patterns || [];

  return (
    <main className="message-result-page">
      <div className="message-result-header"><h1>Message Scan Result</h1><p>Analysis from the CyberShield API.</p></div>
      <section className="message-result-card">
        <div className={`message-result-status ${levelClass}`}>{threat ? "!" : caution ? "?" : "✓"}</div>
        <h2>{title}</h2>
        <p className="message-result-description">Risk level: <strong>{risk}</strong> · Risk score: <strong>{result.risk_score ?? "—"}/100</strong></p>
        <div className="scanned-message"><span>Scanned message</span><p>{message}</p></div>
        <div className="message-result-details">
          <div><span>Model prediction</span><strong>{result.ml_prediction || "Not evaluated"}</strong></div>
          <div><span>Model confidence</span><strong>{confidence}</strong></div>
          <div><span>Language signal</span><strong>{language}</strong></div>
        </div>
        <div className="result-findings"><h3>Detected indicators</h3>
          {patterns.length ? <ul>{patterns.map((pattern) => <li key={pattern}>{pattern}</li>)}</ul> : <p>No indicators were returned by the configured checks.</p>}
        </div>
        <div className="message-result-actions">
          <button className="primary-btn" onClick={() => navigate("/message-scanner")}>Scan another message</button>
          <button className="secondary-result-btn" onClick={() => navigate("/scan-history")}>View scan history</button>
        </div>
        <p className="auth-note">Automated analysis can be wrong. Do not use a “safe” result as proof that a message is legitimate.</p>
      </section>
    </main>
  );
}

export default MessageResult;
