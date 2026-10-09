import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="app">

      

      {/* MAIN */}
      <main className="main">

        {/* TOPBAR */}
        <header className="topbar">

          <div>
            <h1>Security Dashboard</h1>

            <p>
              Stay protected from online fraud and cyber threats.
            </p>
          </div>

          <div className="profile">

            <div className="notification">
              🔔
            </div>

            <div className="avatar">
              A
            </div>

            <div>
              <strong>Citizen</strong>
              <small>Protected Account</small>
            </div>

          </div>

        </header>

        {/* SECURITY STATUS */}
        <section className="security-status">

          <div>

            <div className="status-dot"></div>

            <div>
              <h3>Your Security Status</h3>
              <p>Your account is currently protected.</p>
            </div>

          </div>

          <strong>SECURE</strong>

        </section>

        {/* STATS */}
        <section className="stats">

          <div className="stat-card">

            <div className="stat-icon blue">
              🔍
            </div>

            <div>
              <span>Total Scans</span>
              <h2>128</h2>
              <small>All security scans</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Safe Scans</span>
              <h2>114</h2>
              <small>Safe websites/messages</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠️
            </div>

            <div>
              <span>Threats Detected</span>
              <h2>14</h2>
              <small>Potential threats found</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              📋
            </div>

            <div>
              <span>Reports Submitted</span>
              <h2>6</h2>
              <small>Fraud reports submitted</small>
            </div>

          </div>

        </section>

        {/* QUICK SCAN */}
        <section>

          <div className="section-heading">

            <h2>Quick Security Scan</h2>

            <p>
              Check suspicious websites and messages instantly.
            </p>

          </div>

          <div className="scanner-grid">

            {/* URL SCANNER */}
            <div className="scanner-card">

              <div className="scanner-card-header">

                <div className="large-icon blue-bg">
                  🔗
                </div>

                <div>
                  <h3>URL Scanner</h3>

                  <p>
                    Check a website for phishing and malware.
                  </p>
                </div>

              </div>

              <button
                className="primary-btn"
                onClick={() => navigate("/url-scanner")}
              >
                Open URL Scanner →
              </button>

              <small>
                Scan suspicious websites securely
              </small>

            </div>

            {/* MESSAGE SCANNER */}
            <div className="scanner-card">

              <div className="scanner-card-header">

                <div className="large-icon purple-bg">
                  💬
                </div>

                <div>
                  <h3>Message Scanner</h3>

                  <p>
                    Detect scams and suspicious messages.
                  </p>
                </div>

              </div>

              <button
                className="primary-btn purple-btn"
                onClick={() => navigate("/message-scanner")}
              >
                Open Message Scanner →
              </button>

              <small>
                Detect phishing and scam patterns
              </small>

            </div>

          </div>

        </section>

        {/* BOTTOM */}
        <section className="bottom-grid">

          {/* RECENT ACTIVITY */}
          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Recent Activity</h2>
                <p>Your latest security scans</p>
              </div>

              <button className="text-btn">
                View All
              </button>

            </div>

            <div className="activity">

              <div className="activity-icon safe">
                ✓
              </div>

              <div>
                <strong>google.com</strong>
                <span>URL scanned</span>
              </div>

              <small>Safe</small>

            </div>

            <div className="activity">

              <div className="activity-icon danger">
                !
              </div>

              <div>
                <strong>Unknown website</strong>
                <span>URL scanned</span>
              </div>

              <small>Threat</small>

            </div>

            <div className="activity">

              <div className="activity-icon safe">
                ✓
              </div>

              <div>
                <strong>Bank message</strong>
                <span>Message scanned</span>
              </div>

              <small>Safe</small>

            </div>

          </div>

          {/* THREAT OVERVIEW */}
          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Threat Overview</h2>
                <p>Detected threats by category</p>
              </div>

            </div>

            <div className="threat-row">

              <span>Phishing</span>
              <strong>42%</strong>

              <div className="progress">
                <div className="progress-fill phishing"></div>
              </div>

            </div>

            <div className="threat-row">

              <span>Scams</span>
              <strong>28%</strong>

              <div className="progress">
                <div className="progress-fill scams"></div>
              </div>

            </div>

            <div className="threat-row">

              <span>Malicious Websites</span>
              <strong>20%</strong>

              <div className="progress">
                <div className="progress-fill malicious"></div>
              </div>

            </div>

            <div className="threat-row">

              <span>Other</span>
              <strong>10%</strong>

              <div className="progress">
                <div className="progress-fill other"></div>
              </div>

            </div>

          </div>

        </section>

        {/* REPORT */}
        <section className="report-banner">

          <div>

            <h2>
              Encountered a suspicious activity?
            </h2>

            <p>
              Report cyber fraud and help protect other citizens.
            </p>

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