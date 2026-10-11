
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, listReports } from "../lib/api";
import { useAuth } from "../auth/useAuth";

function Dashboard() {
  const navigate = useNavigate();
  const { email, token } = useAuth();

  const [reports, setReports] = useState([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [apiStatus, setApiStatus] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest("/health/ready")
      .then(() => {
        if (active) setApiStatus("ready");
      })
      .catch(() => {
        if (active) setApiStatus("unavailable");
      });

    if (token) {
      Promise.all([
        listReports(token),
        apiRequest("/summary", { token }),
      ])
        .then(([scanData, summary]) => {
          if (!active) return;

          setReports(scanData.reports || []);
          setScanCount(summary.saved_scans || 0);
          setIncidentCount(summary.incident_reports || 0);
        })
        .catch((requestError) => {
          if (active) setError(requestError.message);
        });
    }

    return () => {
      active = false;
    };
  }, [token]);

  const stats = useMemo(
    () => ({
      total: scanCount,
      safe: reports.filter(
        (report) => report.result?.risk_level === "LOW"
      ).length,
      threats: reports.filter((report) =>
        ["HIGH", "CRITICAL"].includes(report.result?.risk_level)
      ).length,
      incidents: incidentCount,
    }),
    [reports, incidentCount, scanCount]
  );

  const riskCounts = useMemo(
    () =>
      reports.reduce((counts, report) => {
        const level = report.result?.risk_level || "UNKNOWN";
        counts[level] = (counts[level] || 0) + 1;
        return counts;
      }, {}),
    [reports]
  );

  const latestReports = reports.slice(0, 4);

  return (
    <div className="app">
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Security Dashboard</h1>
            <p>Monitor your security and recent activity.</p>
          </div>

          <div className="profile">
            <div className="avatar">
              {email ? email[0].toUpperCase() : "G"}
            </div>
            <div>
              <strong>{email || "Guest"}</strong>
              <small>
                {email ? "Signed-in account" : "Guest account"}
              </small>
            </div>
          </div>
        </header>

        <section className="security-status">
          <div>
            <div
              className={`status-dot ${
                apiStatus === "unavailable" ? "status-down" : ""
              }`}
            />
            <div>
              <h3>Security Status</h3>
              <p>
                {apiStatus === "ready"
                  ? "Analysis service is ready."
                  : apiStatus === "unavailable"
                  ? "Analysis service is unavailable."
                  : "Checking service status..."}
              </p>
            </div>
          </div>

          <strong>
            {apiStatus === "ready"
              ? "READY"
              : apiStatus === "unavailable"
              ? "OFFLINE"
              : "CHECKING"}
          </strong>
        </section>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!token && (
          <section className="panel account-prompt">
            <h2>Save your security scans</h2>
            <p>
              Sign in or create an account to save scans and incident reports.
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate("/account")}
            >
              Sign in or Create Account
            </button>
          </section>
        )}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">🔍</div>
            <div>
              <span>Saved Scans</span>
              <h2>{stats.total}</h2>
              <small>All-time total</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Low-Risk Scans</span>
              <h2>{stats.safe}</h2>
              <small>From saved scans</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠️</div>
            <div>
              <span>High-Risk Scans</span>
              <h2>{stats.threats}</h2>
              <small>High or critical risk</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📋</div>
            <div>
              <span>Incident Reports</span>
              <h2>{stats.incidents}</h2>
              <small>All-time total</small>
            </div>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Quick Security Scan</h2>
            <p>Scan suspicious websites and messages.</p>
          </div>

          <div className="scanner-grid">
            <div className="scanner-card">
              <div className="scanner-card-header">
                <div className="large-icon blue-bg">🔗</div>
                <div>
                  <h3>URL Scanner</h3>
                  <p>
                    Check a website for phishing and other threat signals.
                  </p>
                </div>
              </div>

              <button
                className="primary-btn"
                onClick={() => navigate("/url-scanner")}
              >
                Open URL Scanner →
              </button>
              <small>Check suspicious website links.</small>
            </div>

            <div className="scanner-card">
              <div className="scanner-card-header">
                <div className="large-icon purple-bg">💬</div>
                <div>
                  <h3>Message Scanner</h3>
                  <p>Check suspicious messages for scam patterns.</p>
                </div>
              </div>

              <button
                className="primary-btn purple-btn"
                onClick={() => navigate("/message-scanner")}
              >
                Open Message Scanner →
              </button>
              <small>Analyze suspicious messages.</small>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest saved scans</p>
              </div>

              <button
                className="text-btn"
                onClick={() => navigate("/scan-history")}
              >
                View All
              </button>
            </div>

            {latestReports.length ? (
              latestReports.map((report) => {
                const isUrl = /^https?:\/\//i.test(report.content || "");
                const risky = ["HIGH", "CRITICAL"].includes(
                  report.result?.risk_level
                );

                return (
                  <button
                    className="activity activity-button"
                    key={report.id}
                    onClick={() =>
                      navigate(
                        isUrl ? "/url-result" : "/message-result",
                        {
                          state: {
                            result: report.result,
                            url: isUrl ? report.content : undefined,
                            message: isUrl ? undefined : report.content,
                          },
                        }
                      )
                    }
                  >
                    <span
                      className={`activity-icon ${
                        risky ? "danger" : "safe"
                      }`}
                    >
                      {risky ? "⚠️" : "✓"}
                    </span>

                    <span>
                      <strong>
                        {(report.content || "Saved scan").slice(0, 60)}
                      </strong>
                      <span>
                        {isUrl ? "URL" : "Message"} ·{" "}
                        {report.result?.risk_level || "Unknown"}
                      </span>
                    </span>

                    <small>
                      {report.created_at
                        ? new Date(report.created_at).toLocaleDateString()
                        : ""}
                    </small>
                  </button>
                );
              })
            ) : (
              <p>
                {token
                  ? "No saved scans yet."
                  : "Sign in to see your saved activity."}
              </p>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Risk Overview</h2>
                <p>Summary of saved scans</p>
              </div>
            </div>

            {Object.keys(riskCounts).length ? (
              Object.entries(riskCounts).map(([level, count]) => (
                <div className="threat-row" key={level}>
                  <span>{level}</span>
                  <strong>{count}</strong>
                  <div className="progress">
                    <div
                      className={`progress-fill ${
                        ["HIGH", "CRITICAL"].includes(level)
                          ? "malicious"
                          : level === "MEDIUM"
                          ? "scams"
                          : "phishing"
                      }`}
                      style={{
                        width: `${Math.round(
                          (count / reports.length) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No risk data yet. Run a scan while signed in.</p>
            )}
          </div>
        </section>

        <section className="report-banner">
          <div>
            <h2>Encountered Suspicious Activity?</h2>
            <p>Report suspicious activity to help improve online safety.</p>
          </div>

          <button onClick={() => navigate("/report-fraud")}>
            Report Fraud →
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
