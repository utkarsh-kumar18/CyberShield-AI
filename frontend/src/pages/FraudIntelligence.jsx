
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
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    listReports(token)
      .then((data) => {
        if (active) setReports(data.reports || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load scan data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const patterns = useMemo(() => {
    const counts = new Map();

    reports.forEach((report) => {
      (report.result?.detected_categories || []).forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [reports]);

  const highRisk = reports.filter((report) =>
    ["HIGH", "CRITICAL"].includes(report.result?.risk_level)
  ).length;

  const mediumRisk = reports.filter(
    (report) => report.result?.risk_level === "MEDIUM"
  ).length;

  const lowRisk = reports.filter(
    (report) => report.result?.risk_level === "LOW"
  ).length;

  const riskLevels = [
    { name: "High / Critical", count: highRisk, className: "risk-high" },
    { name: "Medium", count: mediumRisk, className: "risk-medium" },
    { name: "Low", count: lowRisk, className: "risk-low" },
  ];

  return (
    <main className="main intelligence-page">
      <header className="intelligence-header">
        <div>
          <p className="intel-eyebrow">SECURITY ANALYTICS</p>
          <h1>Fraud Intelligence</h1>
          <p>
            Understand detected threat patterns and review insights from
            your saved CyberShield scans.
          </p>
        </div>

        <div className="intel-status">
          <span className="intel-status-dot" />
          Personal scan insights
        </div>
      </header>

      {!token ? (
        <section className="intelligence-panel intel-empty">
          <div className="intel-empty-icon">🔐</div>
          <h2>Your security insights</h2>
          <p>
            Sign in to review saved scans, detected categories, and
            risk-level summaries from your account.
          </p>
          <Link className="primary-btn" to="/account">
            Sign in or create account
          </Link>
        </section>
      ) : (
        <>
          {error && (
            <div className="intel-error" role="alert">
              <strong>Unable to load intelligence data</strong>
              <p>{error}</p>
              <button
                type="button"
                className="intel-retry"
                onClick={() => {
                  setError("");
                  setLoading(true);
                  listReports(token)
                    .then((data) => setReports(data.reports || []))
                    .catch((requestError) =>
                      setError(requestError.message || "Please try again.")
                    )
                    .finally(() => setLoading(false));
                }}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <section className="intelligence-panel intel-loading">
              <div className="intel-loading-mark">CS</div>
              <p>Loading your saved security data...</p>
            </section>
          ) : (
            <>
              <section className="intel-metric-grid">
                <article className="intel-metric-card">
                  <div className="intel-metric-top">
                    <span className="intel-metric-icon intel-blue">↗</span>
                    <span className="intel-metric-label">SCAN ACTIVITY</span>
                  </div>
                  <strong className="intel-metric-value">
                    {reports.length}
                  </strong>
                  <p>Saved scan records</p>
                </article>

                <article className="intel-metric-card">
                  <div className="intel-metric-top">
                    <span className="intel-metric-icon intel-red">!</span>
                    <span className="intel-metric-label">ELEVATED RISK</span>
                  </div>
                  <strong className="intel-metric-value">{highRisk}</strong>
                  <p>High or critical results</p>
                </article>

                <article className="intel-metric-card">
                  <div className="intel-metric-top">
                    <span className="intel-metric-icon intel-purple">⌕</span>
                    <span className="intel-metric-label">THREAT PATTERNS</span>
                  </div>
                  <strong className="intel-metric-value">
                    {patterns.length}
                  </strong>
                  <p>Detected categories shown</p>
                </article>

                <article className="intel-metric-card">
                  <div className="intel-metric-top">
                    <span className="intel-metric-icon intel-green">✓</span>
                    <span className="intel-metric-label">LOW RISK</span>
                  </div>
                  <strong className="intel-metric-value">{lowRisk}</strong>
                  <p>Low-risk scan results</p>
                </article>
              </section>

              <section className="intelligence-panel">
                <div className="intel-panel-heading">
                  <div>
                    <h2>Detected threat categories</h2>
                    <p>
                      Categories found in your saved scan results.
                    </p>
                  </div>
                  <span className="intel-count-badge">
                    {patterns.length} categories
                  </span>
                </div>

                {patterns.length ? (
                  <div className="intel-category-grid">
                    {patterns.map(([category, count], index) => (
                      <article className="intel-category-card" key={category}>
                        <div className="intel-category-top">
                          <span className="intel-category-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="intel-category-symbol">⌕</span>
                        </div>

                        <h3>
                          {category
                            .replaceAll("_", " ")
                            .replaceAll("-", " ")}
                        </h3>

                        <p>Observed across saved scans</p>

                        <div className="intel-category-bottom">
                          <strong>
                            {count} {count === 1 ? "scan" : "scans"}
                          </strong>
                          <div
                            className="intel-category-bar"
                            role="img"
                            aria-label={`${count} scans in this category`}
                          >
                            <span
                              style={{
                                width: `${Math.max(
                                  8,
                                  (count / patterns[0][1]) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="intel-empty-state">
                    <div className="intel-empty-icon">⌕</div>
                    <h3>No detected categories yet</h3>
                    <p>
                      Once saved scan results contain detected categories,
                      they will appear here.
                    </p>
                    <Link to="/url-scanner" className="intel-inline-link">
                      Open URL Scanner →
                    </Link>
                  </div>
                )}
              </section>

              <section className="intelligence-panel">
                <div className="intel-panel-heading">
                  <div>
                    <h2>Risk distribution</h2>
                    <p>Breakdown of saved scan results by risk level.</p>
                  </div>
                </div>

                {reports.length ? (
                  <div className="intel-risk-list">
                    {riskLevels.map((risk) => (
                      <div className="intel-risk-row" key={risk.name}>
                        <div className="intel-risk-label">
                          <span className={`intel-risk-dot ${risk.className}`} />
                          <span>{risk.name}</span>
                        </div>

                        <div className="intel-risk-track">
                          <span
                            className={risk.className}
                            style={{
                              width: `${(risk.count / reports.length) * 100}%`,
                            }}
                          />
                        </div>

                        <strong>{risk.count}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="intel-muted">
                    No saved scan results are available to summarize.
                  </p>
                )}

                <p className="intel-footnote">
                  Risk counts are based on the risk levels returned for
                  your saved scans. Results without a recognized risk level
                  are not included in the three categories above.
                </p>
              </section>

              <section className="intel-guidance">
                <div className="intel-guidance-heading">
                  <span className="intel-guidance-icon">i</span>
                  <div>
                    <h2>Security guidance</h2>
                    <p>Important context when interpreting scan results</p>
                  </div>
                </div>

                <div className="intel-guidance-list">
                  <article>
                    <span>01</span>
                    <div>
                      <h3>Review every result carefully</h3>
                      <p>
                        A low-risk result does not guarantee that a website
                        or message is safe.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span>02</span>
                    <div>
                      <h3>Understand detection limitations</h3>
                      <p>
                        Results depend on the available analysis models,
                        configured threat providers, and supported input.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span>03</span>
                    <div>
                      <h3>Report real cybercrime incidents</h3>
                      <p>
                        For financial cyber fraud in India, call{" "}
                        <a href="tel:1930">1930</a> promptly and use the{" "}
                        <a
                          href="https://cybercrime.gov.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          official reporting portal
                        </a>
                        .
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <p className="intel-disclaimer">
                These insights are based on your own saved scans. They are
                not a live national threat feed or an independently verified
                measure of overall cybercrime activity.
              </p>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default FraudIntelligence;
