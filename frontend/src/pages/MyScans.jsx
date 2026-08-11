import React, { useEffect, useState } from "react";

function MyScans() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:5000/api/scan/my-scans", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    setScans(data.scans);
                }
            })
            .catch((error) => {
                console.error("Failed to load scan history:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const getResultLabel = (result) => {
        const value = String(result).toLowerCase();

        if (value === "safe") {
            return "🟢 Safe";
        }

        if (value === "scam") {
            return "🔴 Scam";
        }

        if (value === "malicious") {
            return "🔴 Malicious";
        }

        if (value === "suspicious") {
            return "🟡 Suspicious";
        }

        if (value === "pending") {
            return "🟠 Pending";
        }

        return result;
    };

    const filteredScans = scans.filter((scan) => {
        const result = String(scan.result).toLowerCase();
        const type = String(scan.scan_type).toLocaleLowerCase();

        if (filter === "websites") {
            return type === "Website" || type === "url";
        }

        if (filter === "messages") {
            return scan.scan_type === "message";
        }

        if (filter === "safe") {
            return result === "safe";
        }

        if (filter === "threats") {
            return (
                result === "scam" ||
                result === "malicious" ||
                result === "suspicious"
            );
        }

        return true;
    });

    return (
        <div style={{ padding: "40px" }}>

            <h1>🔍 Scan History</h1>

            <p>
                View your previous website and message security scans.
            </p>

            <div style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
                marginBottom: "25px",
                width: "100%"
            }}>
                <button onClick={() => setFilter("all")} style={{ flex: 1 }}>
                    All
                </button>

                <button onClick={() => setFilter("websites")} style={{ flex: 1 }}>
                    🔗 Websites
                </button>

                <button onClick={() => setFilter("messages")} style={{ flex: 1 }}>
                    💬 Messages
                </button>

                <button onClick={() => setFilter("safe")} style={{ flex: 1 }}>
                    🟢 Safe
                </button>

                <button onClick={() => setFilter("threats")} style={{ flex: 1 }}>
                    🔴 Threats
                </button>
            </div>

            {loading ? (
                <p>Loading scan history...</p>
            ) : scans.length === 0 ? (
                <div>
                    <h2>No scans yet</h2>
                    <p>
                        Your website and message scans will appear here.
                    </p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "30px"
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Target</th>
                                <th style={thStyle}>Result</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredScans.map((scan) => (
                                <tr key={scan.id}>

                                    <td style={tdStyle}>
                                        #{scan.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {scan.scan_type === "message"
                                            ? "💬 Message"
                                            : "🔗 Website"}
                                    </td>

                                    <td
                                        style={{
                                            ...tdStyle,
                                            maxWidth: "350px",
                                            wordBreak: "break-word"
                                        }}
                                    >
                                        {scan.target}
                                    </td>

                                    <td style={tdStyle}>
                                        {getResultLabel(scan.result)}
                                    </td>

                                    <td style={tdStyle}>
                                        {new Date(
                                            scan.created_at
                                        ).toLocaleString("en-IN")}
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
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "left"
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #ddd"
};

export default MyScans;