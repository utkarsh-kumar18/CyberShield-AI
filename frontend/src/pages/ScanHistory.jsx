
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
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    Promise.all([listReports(token), listIncidents(token)])
      .then(([data, incidentData]) => {
        if (!active) return;
        setReports(data.reports || []);
        setIncidents(incidentData.incident_reports || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const openReport = (report) => {
    const result = report.result || {};
    const isUrl = /^https?:\/\//i.test(report.content || "");

    navigate(isUrl ? "/url-result" : "/message-result", {
      state: {
        result,
        message: isUrl ? undefined : report.content,
        url: isUrl ? report.content : undefined,
        reportId: report.id,
      },
    });
  };

  const getRisk = (report) =>
    String(report.result?.risk_level || "Unknown").toUpperCase();

  const getRiskClass = (risk) => {
    if (risk === "HIGH" || risk === "CRITICAL") return "history-risk-high";
    if (risk === "MEDIUM") return "history-risk-medium";
    if (risk === "LOW" || risk === "SAFE") return "history-risk-low";
    return "history-risk-unknown";
  };

  const formatDate = (date, includeTime = true) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  };

  const urlReports = reports.filter((report) =>
    /^https?:\/\//i.test(report.content || "")
  ).length;

  const messageReports = reports.length - urlReports;

  const riskyReports = reports.filter((report) =>
    ["HIGH", "CRITICAL"].includes(getRisk(report))
  ).length;

  return (
    <main className="main history-page">
      <header className="history-header">
        <div>
          <span className="history-eyebrow">SECURITY ACTIVITY</span>
          <h1>Scan History</h1>
          <p>
            Review your previous URL and message scans, risk assessments,
            and submitted incident reports.
          </p>
        </div>

        <Link className="history-new-scan" to="/url-scanner">
          <span aria-hidden="true">＋</span> New URL scan
        </Link>
      </header>

      {!token ? (
        <section className="history-empty-state">
          <div className="history-empty-icon" aria-hidden="true">◷</div>
          <h2>Your security history</h2>
          <p>
            Sign in to view scans saved to your CyberShield account.
            Guest scans are not stored on the server.
          </p>
          <Link className="history-primary-button" to="/account">
            Sign in or create account
          </Link>
        </section>
      ) : (
        <>
          <section className="history-stats" aria-label="History summary">
            <article className="history-stat-card">
              <div className="history-stat-icon history-stat-blue">⌕</div>
              <div>
                <span>Total saved scans</span>
                <strong>{loading ? "—" : reports.length}</strong>
                <small>URL and message checks</small>
              </div>
            </article>

            <article className="history-stat-card">
              <div className="history-stat-icon history-stat-purple">↗</div>
              <div>
                <span>URL scans</span>
                <strong>{loading ? "—" : urlReports}</strong>
                <small>Website checks</small>
              </div>
            </article>

            <article className="history-stat-card">
              <div className="history-stat-icon history-stat-teal">▤</div>
              <div>
                <span>Message scans</span>
                <strong>{loading ? "—" : messageReports}</strong>
                <small>Message checks</small>
              </div>
            </article>

            <article className="history-stat-card">
              <div className="history-stat-icon history-stat-red">!</div>
              <div>
                <span>High-risk results</span>
                <strong>{loading ? "—" : riskyReports}</strong>
                <small>High or critical risk</small>
              </div>
            </article>
          </section>

          {error && (
            <div className="history-error" role="alert">
              <strong>Unable to load history</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          )}

          <section className="history-panel">
            <div className="history-panel-heading">
              <div>
                <span className="history-section-label">YOUR ACTIVITY</span>
                <h2>Recent scans</h2>
                <p>Select a scan to review its saved result.</p>
              </div>
              <span className="history-count">
                {loading ? "Loading…" : `${reports.length} scans`}
              </span>
            </div>

            {loading ? (
              <div className="history-loading">
                <span className="history-spinner" />
                <p>Loading your security activity…</p>
              </div>
            ) : !error && reports.length === 0 ? (
              <div className="history-empty-inline">
                <div className="history-empty-icon" aria-hidden="true">⌕</div>
                <h3>No saved scans yet</h3>
                <p>
                  Your completed account scans will appear here.
                  Start by checking a suspicious link or message.
                </p>
                <div className="history-empty-actions">
                  <Link to="/url-scanner">Scan a URL</Link>
                  <Link to="/message-scanner">Scan a message</Link>
                </div>
              </div>
            ) : !error ? (
              <div className="history-list">
                {reports.map((report) => {
                  const isUrl = /^https?:\/\//i.test(report.content || "");
                  const risk = getRisk(report);
                  const risky = ["HIGH", "CRITICAL"].includes(risk);
                  const content = report.content || (isUrl ? "URL scan" : "Message scan");

                  return (
                    <button
                      type="button"
                      className="history-row"
                      key={report.id}
                      onClick={() => openReport(report)}
                      aria-label={`Open ${isUrl ? "URL" : "message"} scan result`}
                    >
                      <span
                        className={`history-row-icon ${
                          risky ? "history-row-icon-danger" : "history-row-icon-safe"
                        }`}
                        aria-hidden="true"
                      >
                        {risky ? "!" : isUrl ? "↗" : "✉"}
                      </span>

                      <span className="history-row-content">
                        <strong title={content}>
                          {content.length > 100
                            ? `${content.slice(0, 100)}…`
                            : content}
                        </strong>
                        <span className="history-row-meta">
                          <span>{isUrl ? "URL scan" : "Message scan"}</span>
                          <span className="history-meta-dot">•</span>
                          <time dateTime={report.created_at}>
                            {formatDate(report.created_at)}
                          </time>
                        </span>
                      </span>

                      <span className={`history-risk ${getRiskClass(risk)}`}>
                        {risk}
                      </span>

                      <span className="history-row-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section className="history-panel history-incident-panel">
            <div className="history-panel-heading">
              <div>
                <span className="history-section-label">REPORTED ACTIVITY</span>
                <h2>Incident reports</h2>
                <p>Incident reports submitted through your account.</p>
              </div>
              <Link className="history-secondary-link" to="/report-fraud">
                + Report an incident
              </Link>
            </div>

            {loading ? (
              <div className="history-loading history-loading-small">
                <span className="history-spinner" />
                <p>Loading incident reports…</p>
              </div>
            ) : !error && incidents.length === 0 ? (
              <div className="history-incident-empty">
                <span className="history-incident-icon" aria-hidden="true">▤</span>
                <div>
                  <h3>No incident reports yet</h3>
                  <p>
                    Reports you submit through CyberShield will appear here.
                  </p>
                </div>
              </div>
            ) : !error ? (
              <div className="history-list">
                {incidents.map((incident) => (
                  <article
                    className="history-row history-incident-row"
                    key={`incident-${incident.id}`}
                  >
                    <span className="history-row-icon history-row-icon-danger">
                      !
                    </span>
                    <span className="history-row-content">
                      <strong>{incident.fraud_type || "Incident report"}</strong>
                      <span className="history-row-description">
                        {incident.description || "No description provided"}
                      </span>
                      <span className="history-row-meta">
                        Submitted {formatDate(incident.created_at, false)}
                      </span>
                    </span>
                    <span className="history-risk history-risk-unknown">
                      Submitted
                    </span>
                  </article>
                ))}
              </div>
            ) : null}

            <p className="history-privacy-note">
              <span aria-hidden="true">ⓘ</span>
              These are records saved in CyberShield. Submitting a report here
              does not automatically notify law enforcement.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

export default ScanHistory;
