import { useEffect, useState } from "react";

function ThreatAnalytics() {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        fetch("http://127.0.0.1:5000/api/analytics/stats")

            .then((response) => response.json())

            .then((data) => {
                if (data.status === "success") {
                    setStats(data);
                } else {
                    setError("Unable to load analytics.");
                }
                setLoading(false);
            })

            .catch((error) => {
                console.error(error);
                setError(
                    "Unable to connect to CyberShield server."
                );
                setLoading(false);
            });

    }, []);


    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>Loading Threat Analytics...</h2>
            </div>
        );
    }


    if (error) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>⚠️ {error}</h2>
            </div>
        );
    }


    const fraudEntries = Object.entries(
        stats.fraud_types
    );

    const maxCount = Math.max(
        ...fraudEntries.map(
            ([, count]) => count
        ),
        1
    );


    return (
        <div className="analytics-container">
            <h1>📊 Threat Analytics</h1>
            <p>Security intelligence based on citizen fraud reports.</p>
            
            <div className="analytics-stats-grid">

                <div className="analytics-card">

                    <div style={{ fontSize: "35px", marginBottom: "12px"}}>
                        🚨
                    </div>

                    <h2 style={{
                        margin: "0 0 12px 0"
                    }}>
                        {stats.total_reports}</h2>

                    <p>Total Reports</p>

                </div>

                <div className="analytics-card">

                    <div style={{ fontSize: "35px", marginBottom: "12px"}}>
                        ⏳
                    </div>

                    <h2 style={{
                        margin: "0 0 12px 0"
                    }}>
                        {stats.pending_reports}</h2>

                    <p>Pending Reports</p>

                </div>

                <div className="analytics-card">

                    <div style={{ fontSize: "35px", marginBottom: "12px" }}>
                        ✅
                    </div>

                    <h2 style={{
                        margin: "0 0 12px 0"
                    }}>
                        {stats.resolved_reports}
                    </h2>

                    <p>Resolved Reports</p>

                </div>

                <div className="analytics-card">

                    <div style={{ fontSize: "35px", marginBottom: "12px"}}>
                        💰
                    </div>

                    <h2 style={{
                        margin: "0 0 12px 0"
                    }}>
                        ₹{stats.total_amount.toLocaleString()}
                    </h2>

                    <p>Amount Reported</p>

                </div>

            </div>
            
            <div className="analytics-chart">
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "25px"
                    }}
                >
                    📊 Fraud Reports by Type
                </h2>

                {fraudEntries.length === 0 ? (
                    <p style={{ textAlign: "center" }}>
                        No fraud reports available.
                    </p>
                ) : (
                    fraudEntries.map(([type, count]) => {

                        const percentage =
                            (count / stats.total_reports) * 100;

                        return (
                            <div
                                key={type}
                                style={{
                                    marginBottom: "22px"
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    <span>{type}</span>

                                    <span>
                                        {count}{" "}
                                        ({percentage.toFixed(0)}%)
                                    </span>
                                </div>

                                <div
                                    style={{
                                        width: "100%",
                                        height: "18px",
                                        background: "#e5e7eb",
                                        borderRadius: "10px",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${(count / maxCount) * 100}%`,
                                            height: "100%",
                                            background: "#2563eb",
                                            borderRadius: "10px",
                                            transition: "width 0.5s ease"
                                        }}
                                    />
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="analytics-section">

                <h2>
                    🕒 Recent Reports
                </h2>

                {stats.recent_reports.length === 0 ? (

                    <p>
                        No reports submitted yet.
                    </p>

                ) : (

                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>

                                <tr>

                                    <th style={{
                                        padding: "12px",
                                        textAlign: "left"
                                    }}>
                                        ID
                                    </th>

                                    <th style={{
                                        padding: "12px",
                                        textAlign: "left"
                                    }}>
                                        Type
                                    </th>

                                    <th style={{
                                        padding: "12px",
                                        textAlign: "left"
                                    }}>
                                        Amount
                                    </th>

                                    <th style={{
                                        padding: "12px",
                                        textAlign: "left"
                                    }}>
                                        Status
                                    </th>

                                    <th style={{
                                        padding: "12px",
                                        textAlign: "left"
                                    }}>
                                        Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {stats.recent_reports.map(
                                    (report) => (

                                        <tr key={report.id}>

                                            <td style={{
                                                padding: "12px"
                                            }}>
                                                #{report.id}
                                            </td>

                                            <td style={{
                                                padding: "12px"
                                            }}>
                                                {report.fraud_type}
                                            </td>

                                            <td style={{
                                                padding: "12px"
                                            }}>
                                                ₹{report.amount.toLocaleString()}
                                            </td>

                                            <td style={{
                                                padding: "12px"
                                            }}>
                                                ⏳ {report.status}
                                            </td>

                                            <td style={{
                                                padding: "12px"
                                            }}>
                                                {report.created_at
                                                    ? new Date(
                                                        report.created_at
                                                    ).toLocaleDateString()
                                                    : "-"
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default ThreatAnalytics;