import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listReports } from "../lib/api";
import { useAuth } from "../auth/useAuth";

function FraudIntelligence() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let active = true;
    listReports(token).then((data) => { if (active) setReports(data.reports || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const patterns = useMemo(() => {
    const counts = new Map();
    reports.forEach((report) => (report.result?.detected_categories || []).forEach((category) => counts.set(category, (counts.get(category) || 0) + 1)));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 8);
  }, [reports]);
  const highRisk = reports.filter((report) => ["HIGH", "CRITICAL"].includes(report.result?.risk_level)).length;

  return (
    <main className="intelligence-page">
      <div className="intelligence-header"><h1>Fraud Intelligence</h1><p>Insights from your saved scan results. This page does not claim to be a live national threat feed.</p></div>
      {!token ? <section className="intelligence-panel"><h2>Sign in to view your scan insights</h2><Link className="primary-btn" to="/account">Sign in or create account</Link></section> : (
        <>
          {error && <p className="form-error" role="alert">{error}</p>}
          {loading ? <p>Loading your saved scan data…</p> : <>
            <div className="intelligence-stats">
              <div className="intelligence-stat"><span>Saved scans</span><strong>{reports.length}</strong><small>Most recent 100</small></div>
              <div className="intelligence-stat"><span>High-risk results</span><strong>{highRisk}</strong><small>From saved scans</small></div>
              <div className="intelligence-stat"><span>Detected categories</span><strong>{patterns.length}</strong><small>Across recent results</small></div>
            </div>
            <section className="intelligence-panel"><div className="intelligence-panel-header"><div><h2>Categories in your scans</h2><p>Only categories returned by your own saved analyses appear here.</p></div></div>
              {patterns.length ? <div className="threat-categories">{patterns.map(([category, count]) => <article className="threat-category" key={category}><div className="threat-category-icon">⌕</div><div><h3>{category.replaceAll("_", " ")}</h3><p>Observed in your saved scans.</p><strong>{count} {count === 1 ? "scan" : "scans"}</strong></div></article>)}</div> : <p>No detected categories in your saved scans yet.</p>}
            </section>
            <section className="intelligence-panel"><h2>Use scan results carefully</h2><div className="safety-tips"><div><span>01</span><p>A low-risk result does not prove a link or message is safe.</p></div><div><span>02</span><p>Detection coverage depends on configured threat feeds and supported languages.</p></div><div><span>03</span><p>For online financial fraud in India, call <a href="tel:1930">1930</a> and report through the <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">official portal</a>.</p></div></div></section>
          </>}
        </>
      )}
    </main>
  );
}

export default FraudIntelligence;
