import { useEffect, useState } from "react";
import "./MyReports.css";

function MyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        fetch(
            "http://127.0.0.1:5000/api/fraud/my-reports",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    setReports(data.reports);
                } else {
                    setError(
                        data.message || "Unable to load reports."
                    );
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("My reports error:", error);

                setError("Unable to connect to server.");
                setLoading(false);
            });
    }, []);

    const getStatusClass = (status) => {
        if (status === "resolved") return "status-resolved";
        if (status === "investigating") return "status-investigating";
        return "status-pending";
    };

    if (loading) {
        return (
            <div className="reports-page">
                <div className="reports-loading">
                    <div className="loading-icon">📋</div>
                    <h2>Loading Your Reports</h2>
                    <p>Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-page">

            <div className="reports-container">

                {/* Header */}

                <div className="reports-header">

                    <div className="reports-icon">
                        🛡️
                    </div>

                    <h1>My Fraud Reports</h1>

                    <p>
                        Track and manage the fraud reports
                        you have submitted.
                    </p>

                </div>


                {/* Error */}

                {error && (
                    <div className="reports-message error">
                        ⚠️ {error}
                    </div>
                )}


                {/* Empty state */}

                {!error && reports.length === 0 && (
                    <div className="empty-reports">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h2>No Fraud Reports Yet</h2>

                        <p>
                            You haven't submitted any fraud
                            reports yet.
                        </p>

                        <a href="/report-fraud">
                            Report an Incident →
                        </a>

                    </div>
                )}


                {/* Reports */}

                {reports.length > 0 && (
                    <div className="reports-card">

                        <div className="reports-card-header">

                            <div>
                                <h2>
                                    Submitted Reports
                                </h2>

                                <p>
                                    {reports.length} report
                                    {reports.length !== 1
                                        ? "s"
                                        : ""} found
                                </p>
                            </div>

                            <div className="report-count">
                                {reports.length}
                            </div>

                        </div>


                        <div className="table-wrapper">

                            <table>

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fraud Type</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {reports.map((report) => (

                                        <tr key={report.id}>

                                            <td>
                                                <strong>
                                                    #{report.id}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="fraud-type">
                                                    {report.fraud_type}
                                                </span>
                                            </td>

                                            <td className="description-cell">
                                                {report.description}
                                            </td>

                                            <td>
                                                <strong>
                                                    ₹
                                                    {Number(
                                                        report.amount || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        report.status
                                                    )}`}
                                                >
                                                    {report.status ===
                                                    "resolved"
                                                        ? "✓ Resolved"
                                                        : report.status ===
                                                          "investigating"
                                                        ? "◉ Investigating"
                                                        : "◷ Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                {report.created_at
                                                    ? new Date(
                                                          report.created_at
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "-"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}


                {/* Security note */}

                <div className="reports-security">
                    🛡️ Your reports are securely associated with
                    your account.
                </div>

            </div>

        </div>
    );
}

export default MyReports;