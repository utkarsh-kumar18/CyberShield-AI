
function HelpSupport() {
  const faqs = [
    {
      icon: "01",
      title: "How do I scan a suspicious website?",
      description:
        "Open URL Scanner, enter the website address, and start the scan. Review the risk assessment before interacting with the website.",
    },
    {
      icon: "02",
      title: "How do I check a suspicious message?",
      description:
        "Open Message Scanner, paste the message, and submit it for analysis. Review the results for potential scam indicators.",
    },
    {
      icon: "03",
      title: "How can I report cyber fraud?",
      description:
        "Use the Report Fraud page to record the incident. For an official complaint, contact the appropriate cybercrime reporting service.",
    },
    {
      icon: "04",
      title: "How can I protect my account?",
      description:
        "Never share your OTP, PIN, or password. Verify links and payment requests, use strong passwords, and enable two-factor authentication.",
    },
  ];

  return (
    <main className="main help-page">
      <header className="page-header">
        <p className="help-eyebrow">SUPPORT CENTRE</p>
        <h1>Help &amp; Support</h1>
        <p>
          Find answers, learn safe practices, and get help using CyberShield.
        </p>
      </header>

      <section className="help-welcome">
        <div className="help-welcome-icon" aria-hidden="true">
          ?
        </div>
        <div>
          <h2>How can we help you?</h2>
          <p>
            Browse the frequently asked questions below for guidance on
            scanning links, checking messages, and reporting suspicious
            activity.
          </p>
        </div>
      </section>

      <section className="panel help-faq-panel">
        <div className="help-section-heading">
          <div>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>
          <span className="help-count">04 ARTICLES</span>
        </div>

        <div className="help-faq-list">
          {faqs.map((faq) => (
            <article className="help-faq-item" key={faq.icon}>
              <div className="help-faq-number">{faq.icon}</div>
              <div className="help-faq-content">
                <h3>{faq.title}</h3>
                <p>{faq.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="help-emergency">
        <div className="help-emergency-content">
          <span className="help-emergency-label">OFFICIAL CYBERCRIME SUPPORT</span>
          <h2>Need to report financial cyber fraud?</h2>
          <p>
            If you have experienced financial cyber fraud in India, report it
            promptly through the official helpline or government portal.
          </p>
        </div>

        <div className="help-emergency-actions">
          <a className="help-call-button" href="tel:1930">
            Call 1930
          </a>
          <a
            className="help-portal-link"
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official reporting portal ↗
          </a>
        </div>
      </section>

      <p className="help-disclaimer">
        CyberShield reports are stored within the application and are not
        automatically forwarded to law enforcement. Use official channels
        for actual cybercrime complaints.
      </p>
    </main>
  );
}

export default HelpSupport;
