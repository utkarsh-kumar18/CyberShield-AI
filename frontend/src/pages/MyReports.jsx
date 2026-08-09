import { useEffect, useState } from "react";

function MyReports() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please login to view your reports.");
            setLoading(false);
            return;
        }

        fetch("http://127.0.0.1:5000/api/fraud/my-reports", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
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

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
                <h2>My Fraud Reports</h2>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "40px auto",
                padding: "20px"
            }}
        >

            <h1 style={{ textAlign: "center" }}>
                🛡️ My Fraud Reports
            </h1>

            <p
                style={{
                    textAlign: "center",
                    color: "#666"
                }}
            >
                View the fraud reports you have submitted.
            </p>

            {error && (
                <p
                    style={{
                        textAlign: "center",
                        color: "red"
                    }}
                >
                    {error}
                </p>
            )}

            {!error && reports.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "40px"
                    }}
                >
                    <h3>No fraud reports found.</h3>
                    <p>
                        You have not submitted any fraud reports yet.
                    </p>
                </div>
            )}

            {reports.length > 0 && (
                <div
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        marginTop: "30px"
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>
                            <tr
                                style={{
                                    background: "#f5f5f5"
                                }}
                            >
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Description</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                        </thead>

                        <tbody>

                            {reports.map((report) => (

                                <tr key={report.id}>

                                    <td style={tdStyle}>
                                        #{report.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {report.fraud_type}
                                    </td>

                                    <td style={tdStyle}>
                                        {report.description}
                                    </td>

                                    <td style={tdStyle}>
                                        ₹{Number(
                                            report.amount || 0
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                fontWeight: "bold",
                                                color:
                                                    report.status === "resolved"
                                                        ? "green"
                                                        : report.status === "investigating"
                                                        ? "#d97706"
                                                        : "#555"
                                            }}
                                        >
                                            {report.status}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>
                                        {report.created_at
                                            ? new Date(
                                                report.created_at
                                            ).toLocaleDateString()
                                            : "-"}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}

const thStyle = {
    padding: "15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    color: "#555"
};

const tdStyle = {
    padding: "15px",
    borderBottom: "1px solid #eee",
    color: "#555"
};

export default MyReports;