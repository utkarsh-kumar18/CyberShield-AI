import { useState } from "react";
import "./ReportFraud.css";

function ReportFraud() {
    const [fraudType, setFraudType] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [suspiciousUrl, setSuspiciousUrl] = useState("");

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitReport = async (e) => {
        e.preventDefault();

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (!user) {
            setResult({
                status: "error",
                message: "Please login first."
            });
            return;
        }

        if (!fraudType.trim()) {
            setResult({
                status: "error",
                message: "Please select a fraud type."
            });
            return;
        }

        if (!description.trim()) {
            setResult({
                status: "error",
                message: "Please enter a description."
            });
            return;
        }

        if (amount !== "" && Number(amount) < 0) {
            setResult({
                status: "error",
                message: "Amount cannot be negative."
            });
            return;
        }

        if (
            suspiciousUrl.trim() &&
            !/^https?:\/\/.+/i.test(suspiciousUrl.trim())
        ) {
            setResult({
                status: "error",
                message:
                    "Please enter a valid URL starting with http:// or https://."
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://127.0.0.1:5000/api/fraud/report",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        fraud_type: fraudType,
                        description: description,
                        amount: amount || 0,
                        suspicious_url: suspiciousUrl
                    })
                }
            );

            const data = await response.json();

            setResult(data);

            if (response.ok) {
                setFraudType("");
                setDescription("");
                setAmount("");
                setSuspiciousUrl("");
            }

        } catch (error) {
            console.error(error);

            setResult({
                status: "error",
                message: "Unable to connect to server."
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fraud-page">

            <div className="fraud-card">

                {/* Header */}

                <div className="fraud-header">

                    <div className="fraud-icon">
                        🛡️
                    </div>

                    <h1>Report Cyber Fraud</h1>

                    <p>
                        Report suspicious cyber fraud or scam
                        incidents to CyberShield AI.
                    </p>

                </div>


                {/* Form */}

                <form
                    className="fraud-form"
                    onSubmit={submitReport}
                >

                    {/* Fraud Type */}

                    <div className="fraud-field">

                        <label>
                            Fraud Type
                        </label>

                        <select
                            value={fraudType}
                            onChange={(e) =>
                                setFraudType(e.target.value)
                            }
                            required
                        >

                            <option value="">
                                Select fraud type
                            </option>

                            <option value="UPI Fraud">
                                UPI Fraud
                            </option>

                            <option value="Bank Fraud">
                                Bank Fraud
                            </option>

                            <option value="OTP Scam">
                                OTP Scam
                            </option>

                            <option value="Phishing">
                                Phishing
                            </option>

                            <option value="Job Scam">
                                Job Scam
                            </option>

                            <option value="Investment Scam">
                                Investment Scam
                            </option>

                            <option value="Online Shopping Scam">
                                Online Shopping Scam
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Description */}

                    <div className="fraud-field">

                        <label>
                            What Happened?
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Describe the incident in detail..."
                            rows="6"
                            required
                        />

                        <span className="field-help">
                            Include important details such as
                            messages, calls, transactions or links.
                        </span>

                    </div>


                    {/* Amount */}

                    <div className="fraud-field">

                        <label>
                            Amount Lost <span>(₹)</span>
                        </label>

                        <div className="input-with-icon">

                            <span>₹</span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value)
                                }
                                placeholder="Example: 5000"
                            />

                        </div>

                    </div>


                    {/* URL */}

                    <div className="fraud-field">

                        <label>
                            Suspicious URL
                            <span className="optional">
                                Optional
                            </span>
                        </label>

                        <input
                            type="url"
                            value={suspiciousUrl}
                            onChange={(e) =>
                                setSuspiciousUrl(e.target.value)
                            }
                            placeholder="https://example.com"
                        />

                        <span className="field-help">
                            Provide the suspicious website URL if
                            one was involved.
                        </span>

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        className="fraud-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Submitting Report..."
                            : "Submit Fraud Report →"
                        }

                    </button>

                </form>


                {/* Result */}

                {result && (

                    <div
                        className={
                            result.status === "success"
                                ? "fraud-result success"
                                : "fraud-result error"
                        }
                    >

                        {result.status === "success" ? (

                            <>
                                <div className="result-icon">
                                    ✅
                                </div>

                                <div>

                                    <h3>
                                        Report Submitted Successfully
                                    </h3>

                                    <p>
                                        Your report has been received
                                        by CyberShield AI.
                                    </p>

                                    {result.report_id && (
                                        <p>
                                            <strong>
                                                Report ID:
                                            </strong>{" "}
                                            #{result.report_id}
                                        </p>
                                    )}

                                </div>
                            </>

                        ) : (

                            <>
                                <div className="result-icon">
                                    ⚠️
                                </div>

                                <div>

                                    <h3>
                                        Unable to Submit Report
                                    </h3>

                                    <p>
                                        {result.message}
                                    </p>

                                </div>
                            </>

                        )}

                    </div>
                )}


                {/* Security note */}

                <div className="fraud-security">

                    🛡️ Your information is handled securely.

                </div>

            </div>

        </div>
    );
}

export default ReportFraud;