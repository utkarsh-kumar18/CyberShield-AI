import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { submitIncident } from "../lib/api";

const initialForm = { fraud_type: "", description: "", website: "", contact: "", amount_lost: "" };

function ReportFraud() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [incidentId, setIncidentId] = useState(null);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await submitIncident({
        ...form,
        website: form.website.trim(),
        contact: form.contact.trim(),
        amount_lost: form.amount_lost === "" ? null : Number(form.amount_lost),
      }, token);
      setIncidentId(result.incident_id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (incidentId) {
    return <div className="report-page"><div className="report-success">
      <div className="success-icon">✓</div>
      <h1>Report received</h1>
      <p>Your CyberShield report reference is <strong>#{incidentId}</strong>. It is saved in your account and does not notify law enforcement. For an online financial fraud, call <a href="tel:1930">1930</a> and file through the <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">National Cyber Crime Reporting Portal</a>.</p>
      <button className="primary-btn" onClick={() => { setForm(initialForm); setIncidentId(null); }}>Submit another report</button>
    </div></div>;
  }

  return (
    <div className="report-page">
      <div className="report-header"><h1>Report Cyber Fraud</h1><p>Share an incident with CyberShield so you can keep a record in your account.</p></div>
      <div className="report-card">
        {!token ? (
          <div className="panel"><h2>Sign in to submit a report</h2><p>Reports contain potentially sensitive details and are linked to your account.</p><Link className="primary-btn" to="/account">Sign in or create account</Link></div>
        ) : (
          <>
            <p className="privacy-note">Do not include passwords, PINs, OTPs, full card numbers, or other authentication secrets. This independent service is not an official complaint channel. For online financial fraud, call <a href="tel:1930">1930</a> and use the <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">official portal</a>.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label htmlFor="fraud-type">Fraud type</label>
                <select id="fraud-type" name="fraud_type" value={form.fraud_type} onChange={update} required>
                  <option value="">Select fraud type</option><option>Phishing</option><option>Online Scam</option><option>Financial Fraud</option><option>Identity Theft</option><option>Fake Website</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label htmlFor="fraud-description">What happened?</label>
                <textarea id="fraud-description" name="description" value={form.description} onChange={update} maxLength={10000} required placeholder="Describe the suspicious activity or fraud..." />
              </div>
              <div className="form-row">
                <div className="form-group"><label htmlFor="fraud-website">Suspicious website</label>
                  <input id="fraud-website" name="website" type="url" maxLength={2048} value={form.website} onChange={update} placeholder="https://example.com" />
                </div>
                <div className="form-group"><label htmlFor="fraud-contact">Phone / contact (optional)</label>
                  <input id="fraud-contact" name="contact" maxLength={80} value={form.contact} onChange={update} placeholder="Optional" />
                </div>
              </div>
              <div className="form-group"><label htmlFor="fraud-amount">Amount lost (₹, optional)</label>
                <input id="fraud-amount" name="amount_lost" type="number" min="0" max="999999999999.99" step="0.01" value={form.amount_lost} onChange={update} placeholder="Enter amount if applicable" />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="report-submit-btn" disabled={submitting}>{submitting ? "Submitting…" : "Submit report"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportFraud;
