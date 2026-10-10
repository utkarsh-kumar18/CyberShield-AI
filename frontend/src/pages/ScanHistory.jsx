import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listIncidents, listReports } from "../lib/api";
import { useAuth } from "../auth/useAuth";

function ScanHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([listReports(token), listIncidents(token)])
      .then(([data, incidentData]) => {
        if (!active) return;
        setReports(data.reports || []);
        setIncidents(incidentData.incident_reports || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const openReport = (report) => {
    const result = report.result || {};
    const isUrl = /^https?:\/\//i.test(report.content || "");
    navigate(isUrl ? "/url-result" : "/message-result", {
      state: { result, message: isUrl ? undefined : report.content, url: isUrl ? report.content : undefined, reportId: report.id },
    });
  };

  return (
    <main className="main">
      <div className="page-header"><h1>Scan History</h1><p>Recent scans saved to your CyberShield account.</p></div>
      {!token ? (
        <div className="panel"><h2>Sign in to view your saved scans</h2><p>Guest scans are analyzed without being stored on the server.</p><Link className="primary-btn" to="/account">Sign in or create account</Link></div>
      ) : (
        <>
        <div className="panel">
          <h2>Recent scans</h2>
          {loading && <p>Loading your scans…</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {!loading && !error && reports.length === 0 && <p>No saved scans yet. Run a message or URL scan to get started.</p>}
          {reports.map((report) => {
            const isUrl = /^https?:\/\//i.test(report.content || "");
            const risky = ["HIGH", "CRITICAL"].includes(report.result?.risk_level);
            return (
              <button className="history-item" key={report.id} onClick={() => openReport(report)}>
                <span className={`activity-icon ${risky ? "danger" : "safe"}`}>{risky ? "!" : "✓"}</span>
                <span className="history-content"><strong>{isUrl ? report.content : (report.content || "Message scan").slice(0, 90)}</strong><small>{isUrl ? "URL scan" : "Message scan"} · {report.result?.risk_level || "Unknown risk"}</small></span>
                <time dateTime={report.created_at}>{report.created_at ? new Date(report.created_at).toLocaleString() : ""}</time>
              </button>
            );
          })}
        </div>
        <div className="panel history-incidents">
          <h2>Incident reports</h2>
          {!loading && !error && incidents.length === 0 && <p>No incident reports yet.</p>}
          {incidents.map((incident) => <article className="history-item" key={`incident-${incident.id}`}>
            <span className="activity-icon danger">!</span>
            <span className="history-content"><strong>{incident.fraud_type}</strong><small>{incident.description}</small></span>
            <time dateTime={incident.created_at}>{incident.created_at ? new Date(incident.created_at).toLocaleDateString() : ""}</time>
          </article>)}
        </div>
        </>
      )}
    </main>
  );
}

export default ScanHistory;
