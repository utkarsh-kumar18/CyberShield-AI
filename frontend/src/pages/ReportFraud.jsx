import { useState } from "react";

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
                message: "Please enter a valid URL starting with http:// or https://."
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {

            const token = localStorage.getItem("token")

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

        <div style={{
            maxWidth: "800px",
            margin: "40px auto",
            padding: "20px"
        }}>

            <h1>🚨 Report Fraud</h1>

            <p>
                Report suspicious cyber fraud or scam
                incidents to CyberShield AI.
            </p>


            <form onSubmit={submitReport}>

                <label>
                    <strong>Fraud Type</strong>
                </label>

                <br />

                <select
                    value={fraudType}
                    onChange={(e) =>
                        setFraudType(e.target.value)
                    }
                    required
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "8px 0 20px"
                    }}
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


                <label>
                    <strong>Description</strong>
                </label>

                <br />

                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    placeholder="Describe what happened..."
                    rows="7"
                    required
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "8px 0 20px",
                        resize: "vertical"
                    }}
                />


                <label>
                    <strong>Amount Lost (₹)</strong>
                </label>

                <br />

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) =>
                        setAmount(e.target.value)
                    }
                    placeholder="Example: 5000"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "8px 0 20px"
                    }}
                />


                <label>
                    <strong>Suspicious URL (Optional)</strong>
                </label>

                <br />

                <input
                    type="url"
                    value={suspiciousUrl}
                    onChange={(e) =>
                        setSuspiciousUrl(e.target.value)
                    }
                    placeholder="https://example.com"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "8px 0 20px"
                    }}
                />


                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px 25px",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >

                    {loading
                        ? "Submitting..."
                        : "Submit Fraud Report"
                    }

                </button>

            </form>


            {result && (

                <div style={{
                    marginTop: "25px",
                    padding: "20px",
                    borderRadius: "10px",
                    border: "1px solid #ddd"
                }}>

                    {result.status === "success" ? (

                        <>
                            <h2>
                                ✅ Report Submitted
                            </h2>

                            <p>
                                Your fraud report has been
                                successfully submitted.
                            </p>

                            <p>
                                <strong>
                                    Report ID:
                                </strong>{" "}
                                #{result.report_id}
                            </p>
                        </>

                    ) : (

                        <>
                            <h2>
                                ⚠️ Error
                            </h2>

                            <p>
                                {result.message}
                            </p>
                        </>

                    )}

                </div>

            )}

        </div>

    );
}

export default ReportFraud;