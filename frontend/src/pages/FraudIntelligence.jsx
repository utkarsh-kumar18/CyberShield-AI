function FraudIntelligence() {
  return (
    <div className="intelligence-page">

      <div className="intelligence-header">

        <h1>Fraud Intelligence</h1>

        <p>
          Stay informed about current cyber fraud and online threats.
        </p>

      </div>

      {/* THREAT SUMMARY */}
      <div className="intelligence-stats">

        <div className="intelligence-stat">
          <span>Active Threats</span>
          <strong>24</strong>
          <small>Currently monitored</small>
        </div>

        <div className="intelligence-stat">
          <span>Phishing Threats</span>
          <strong>42%</strong>
          <small>Of detected threats</small>
        </div>

        <div className="intelligence-stat">
          <span>Scam Reports</span>
          <strong>186</strong>
          <small>Reported by citizens</small>
        </div>

        <div className="intelligence-stat">
          <span>Threats Blocked</span>
          <strong>1,284</strong>
          <small>Last 30 days</small>
        </div>

      </div>

      {/* THREAT CATEGORIES */}
      <div className="intelligence-panel">

        <div className="intelligence-panel-header">

          <div>
            <h2>Major Threat Categories</h2>

            <p>
              Common cyber threats detected across the platform.
            </p>
          </div>

        </div>

        <div className="threat-categories">

          <div className="threat-category">

            <div className="threat-category-icon">
              🎣
            </div>

            <div>
              <h3>Phishing</h3>

              <p>
                Fake websites and messages designed to steal
                sensitive information.
              </p>

              <strong>High Risk</strong>
            </div>

          </div>

          <div className="threat-category">

            <div className="threat-category-icon">
              💰
            </div>

            <div>
              <h3>Online Scams</h3>

              <p>
                Fraudulent offers, payment scams and fake
                customer support.
              </p>

              <strong>High Risk</strong>
            </div>

          </div>

          <div className="threat-category">

            <div className="threat-category-icon">
              🌐
            </div>

            <div>
              <h3>Malicious Websites</h3>

              <p>
                Websites that may contain malware or harmful
                content.
              </p>

              <strong>Medium Risk</strong>
            </div>

          </div>

          <div className="threat-category">

            <div className="threat-category-icon">
              📱
            </div>

            <div>
              <h3>SMS & Message Fraud</h3>

              <p>
                Suspicious messages attempting to trick users
                into taking harmful actions.
              </p>

              <strong>Medium Risk</strong>
            </div>

          </div>

        </div>

      </div>

      {/* SAFETY TIPS */}
      <div className="intelligence-panel">

        <div className="intelligence-panel-header">

          <div>
            <h2>Stay Safe Online</h2>

            <p>
              Simple steps to protect yourself from cyber fraud.
            </p>
          </div>

        </div>

        <div className="safety-tips">

          <div>
            <span>01</span>
            <p>Never share your OTP, PIN or password with anyone.</p>
          </div>

          <div>
            <span>02</span>
            <p>Check website URLs carefully before entering personal information.</p>
          </div>

          <div>
            <span>03</span>
            <p>Do not click suspicious links received through messages or email.</p>
          </div>

          <div>
            <span>04</span>
            <p>Report suspicious activity as soon as possible.</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default FraudIntelligence;