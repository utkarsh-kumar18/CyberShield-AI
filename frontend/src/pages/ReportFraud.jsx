import { useState } from "react";

function ReportFraud() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="report-page">

        <div className="report-success">

          <div className="success-icon">
            ✓
          </div>

          <h1>Report Submitted</h1>

          <p>
            Thank you for reporting this incident. Your report has been
            recorded and will help protect other citizens.
          </p>

          <button
            className="primary-btn"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Report
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="report-page">

      <div className="report-header">

        <h1>Report Cyber Fraud</h1>

        <p>
          Report suspicious activity or cyber fraud to help protect
          other citizens.
        </p>

      </div>

      <div className="report-card">

        <form onSubmit={handleSubmit}>

          {/* FRAUD TYPE */}
          <div className="form-group">

            <label>Fraud Type</label>

            <select required>
              <option value="">Select fraud type</option>
              <option>Phishing</option>
              <option>Online Scam</option>
              <option>Financial Fraud</option>
              <option>Identity Theft</option>
              <option>Fake Website</option>
              <option>Other</option>
            </select>

          </div>

          {/* DESCRIPTION */}
          <div className="form-group">

            <label>What happened?</label>

            <textarea
              required
              placeholder="Describe the suspicious activity or fraud..."
            ></textarea>

          </div>

          {/* WEBSITE / PHONE */}
          <div className="form-row">

            <div className="form-group">

              <label>Suspicious Website</label>

              <input
                type="text"
                placeholder="https://example.com"
              />

            </div>

            <div className="form-group">

              <label>Phone / Contact</label>

              <input
                type="text"
                placeholder="Optional"
              />

            </div>

          </div>

          {/* AMOUNT */}
          <div className="form-group">

            <label>Amount Lost (₹)</label>

            <input
              type="number"
              min="0"
              placeholder="Enter amount if applicable"
            />

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="report-submit-btn"
          >
            Submit Fraud Report →
          </button>

        </form>

      </div>

    </div>
  );
}

export default ReportFraud;