
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { submitIncident } from "../lib/api";

const initialForm = {
  fraud_type: "",
  description: "",
  website: "",
  contact: "",
  amount_lost: "",
};

const fraudTypes = [
  "Phishing",
  "Online Scam",
  "Financial Fraud",
  "Identity Theft",
  "Fake Website",
  "Social Media Scam",
  "Other",
];

function ReportFraud() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [incidentId, setIncidentId] = useState(null);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await submitIncident(
        {
          ...form,
          website: form.website.trim(),
          contact: form.contact.trim(),
          amount_lost:
            form.amount_lost === "" ? null : Number(form.amount_lost),
        },
        token
      );

      setIncidentId(result.incident_id);
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (incidentId) {
    return (
      <main className="main report-page">
        <div className="report-card report-success">
          <div className="report-success-icon" aria-hidden="true">
            ✓
          </div>

          <p className="report-eyebrow">REPORT SUBMITTED</p>
          <h1>Report received successfully</h1>
          <p>
            Your incident has been recorded in CyberShield. Keep the
            reference number below for your records.
          </p>

          <div className="report-reference">
            <span>Incident reference</span>
            <strong>#{incidentId}</strong>
          </div>

          <div className="report-success-note">
            <strong>Important</strong>
            <p>
              This report does not automatically notify law enforcement.
              For online financial fraud in India, call{" "}
              <a href="tel:1930">1930</a> promptly and submit an official
              complaint through the{" "}
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                National Cyber Crime Reporting Portal
              </a>
              .
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setForm(initialForm);
              setIncidentId(null);
              setError("");
            }}
          >
            Submit another report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main report-page">
      <header className="report-header">
        <p className="report-eyebrow">CYBERSHIELD SECURITY CENTRE</p>
        <h1>Report Cyber Fraud</h1>
        <p>
          Document suspicious activity and keep an incident record in
          your CyberShield account.
        </p>
      </header>

      <section className="report-info-banner">
        <div className="report-info-icon" aria-hidden="true">
          i
        </div>
        <div>
          <h2>Before you submit</h2>
          <p>
            Provide as much relevant detail as you can. Never include
            passwords, PINs, OTPs, or complete card details in your report.
          </p>
        </div>
      </section>

      {!token ? (
        <section className="report-card">
          <div className="report-login-icon" aria-hidden="true">
            🔒
          </div>
          <h2>Sign in to report an incident</h2>
          <p>
            Sign in or create an account to submit and keep track of
            your incident reports.
          </p>
          <Link className="primary-btn report-login-link" to="/account">
            Sign in or create account
          </Link>
        </section>
      ) : (
        <section className="report-card">
          <div className="report-form-heading">
            <div>
              <h2>Incident details</h2>
              <p>Fields marked with * are required.</p>
            </div>
            <span className="report-private-label">
              <span aria-hidden="true">●</span> Account report
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fraud-type">
                Type of fraud <span className="report-required">*</span>
              </label>
              <select
                id="fraud-type"
                name="fraud_type"
                value={form.fraud_type}
                onChange={update}
                required
              >
                <option value="">Select the incident type</option>
                {fraudTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fraud-description">
                What happened? <span className="report-required">*</span>
              </label>
              <textarea
                id="fraud-description"
                name="description"
                value={form.description}
                onChange={update}
                maxLength={10000}
                minLength={10}
                required
                rows={6}
                placeholder="Describe the incident, how you encountered it, and any suspicious activity you noticed..."
              />
              <div className="report-field-footer">
                <span>Do not include passwords, OTPs, or PINs.</span>
                <span>{form.description.length}/10000</span>
              </div>
            </div>

            <div className="report-form-divider" />

            <div className="report-subheading">
              <h3>Additional information</h3>
              <p>These details are optional but may help document the incident.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fraud-website">Suspicious website URL</label>
                <input
                  id="fraud-website"
                  name="website"
                  type="url"
                  maxLength={2048}
                  value={form.website}
                  onChange={update}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fraud-contact">
                  Suspected phone or contact
                </label>
                <input
                  id="fraud-contact"
                  name="contact"
                  maxLength={80}
                  value={form.contact}
                  onChange={update}
                  placeholder="Phone number or other contact"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fraud-amount">
                Amount lost (₹)
                <span className="report-optional">Optional</span>
              </label>
              <input
                id="fraud-amount"
                name="amount_lost"
                type="number"
                min="0"
                max="999999999999.99"
                step="0.01"
                value={form.amount_lost}
                onChange={update}
                placeholder="0.00"
              />
              <p className="report-field-hint">
                Enter 0 if no money was lost, or leave this field blank.
              </p>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="report-form-footer">
              <p>Your report will be saved to your CyberShield account.</p>
              <button
                type="submit"
                className="report-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting report..." : "Submit report →"}
              </button>
            </div>
          </form>
        </section>
      )}

      <p className="report-disclaimer">
        CyberShield is not an official law-enforcement reporting service.
        For actual cybercrime complaints, use the appropriate official
        reporting channels.
      </p>
    </main>
  );
}

export default ReportFraud;
