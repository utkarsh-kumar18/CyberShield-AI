import { useEffect, useState } from "react";

function AdminPanel() {

    const [reports, setReports] = useState([]);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

    const loadReports = () => {

        const token = localStorage.getItem("token");
        fetch("http://127.0.0.1:5000/api/admin/reports", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

            .then((response) => response.json())

            .then((data) => {

                if (data.status === "success") {
                    setReports(data.reports);
                } else {
                    setError("Unable to load reports.");
                }

                setLoading(false);
            })

            .catch((error) => {

                console.error(error);

                setError(
                    "Unable to connect to server."
                );

                setLoading(false);
            });
    };

    const filteredReports = reports
    .filter((report) => {
        const searchText = search.toLowerCase();

        return (
            report.fraud_type?.toLowerCase().includes(searchText) ||
            report.description?.toLowerCase().includes(searchText) ||
            String(report.id).includes(searchText)
        );
    })
    .filter((report) => {
        return statusFilter === "all" ||
            report.status === statusFilter;
    })
    .filter((report) => {
        return typeFilter === "all" ||
            report.fraud_type === typeFilter;
    })
    .sort((a, b) => {
        if (sortOrder === "newest") {
            return b.id - a.id;
        }

        return a.id - b.id;
    });


    const totalReports = reports.length;

    const pendingReports = reports.filter(
        (report) => report.status === "pending"
    ).length;

    const investigatingReports = reports.filter(
        (report) => report.status === "investigating"
    ).length;

    const resolvedReports = reports.filter(
        (report) => report.status === "resolved"
    ).length;

    const totalAmount = reports.reduce(
        (total, report) => total + Number(report.amount || 0),
        0
    );

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:5000/api/admin/scans", {
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
                console.error("Failed to load scans:", error);
            });
    }, []);

    const updateStatus = async (
        reportId,
        newStatus
    ) => {

        try {

            const response = await fetch(
                `http://127.0.0.1:5000/api/admin/reports/${reportId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data =
                await response.json();

            if (response.ok) {

                setReports((currentReports) =>
                    currentReports.map((report) =>
                        report.id === reportId
                            ? {
                                ...report,
                                status: newStatus
                            }
                            : report
                    )
                );

            } else {

                alert(data.message || "Unable to update report.");

            }

        } catch (error) {

            console.error(error);

            alert(
                "Unable to update report."
            );
        }
    };


    if (loading) {

        return (
            <div style={{
                padding: "40px"
            }}>
                <h2>
                    Loading reports...
                </h2>
            </div>
        );
    }


    if (error) {

        return (
            <div style={{
                padding: "40px"
            }}>
                <h2>
                    ⚠️ {error}
                </h2>
            </div>
        );
    }

        return (
            <>
                <style>{`
                    .admin-page {
                        width: 100%;
                        max-width: 1200px;
                        margin: 30px auto;
                        padding: 20px;
                        box-sizing: border-box;
                        min-width: 0;
                    }

                    .admin-stats {
                        display: grid;
                        grid-template-columns: repeat(5, minmax(0, 1fr));
                        gap: 15px;
                        margin-top: 25px;
                    }

                    .admin-filters {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-top: 20px;
                        padding: 15px;
                        align-items: center;
                        width: 100%;
                        box-sizing: border-box;
                        background: #fff;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    }

                    .admin-search {
                        flex: 1;
                        min-width: 200px;
                        padding: 10px;
                        box-sizing: border-box;
                    }

                    .admin-table-wrapper {
                        margin-top: 30px;
                        background: #fff;
                        border-radius: 12px;
                        padding: 20px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        overflow-x: auto;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .admin-table {
                        width: 100%;
                        min-width: 850px;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }

                    @media (max-width: 700px) {
                        .admin-page {
                            margin: 15px auto;
                            padding: 12px;
                        }

                        .admin-page h1 {
                            font-size: 26px;
                            text-align: center;
                        }

                        .admin-page > p {
                            text-align: center;
                            font-size: 14px;
                        }

                        .admin-stats {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 10px;
                        }

                        .admin-stats .analytics-card {
                            min-width: 0;
                            padding: 14px 8px;
                            text-align: center;
                            box-sizing: border-box;
                        }

                        .admin-stats .analytics-card:last-child {
                            grid-column: 1 / -1;
                        }

                        .admin-stats .analytics-card h2 {
                            font-size: 20px;
                            margin: 5px 0;
                            white-space: nowrap;
                        }

                        .admin-stats .analytics-card p {
                            font-size: 13px;
                            margin: 5px 0;
                        }

                        .admin-filters {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 8px;
                            padding: 12px;
                        }

                        .admin-search {
                            grid-column: 1 / -1;
                            min-width: 0;
                            width: 100%;
                        }

                        .admin-filters select,
                        .admin-filters button {
                            width: 100%;
                            min-width: 0;
                            box-sizing: border-box;
                        }

                        .admin-table-wrapper {
                            padding: 10px;
                        }

                        .admin-table {
                            min-width: 850px;
                        }
                    }

                    @media (max-width: 400px) {
                        .admin-stats {
                            grid-template-columns: 1fr 1fr;
                        }

                        .admin-filters {
                            grid-template-columns: 1fr;
                        }

                        .admin-search {
                            grid-column: auto;
                        }
                    }

                    @media (max-width: 700px) {

                        .admin-page {
                            width: 100%;
                            max-width: 100%;
                            margin: 10px auto;
                            padding: 12px;
                            box-sizing: border-box;
                        }

                        .admin-page h1 {
                            font-size: 26px;
                            text-align: center;
                        }

                        .admin-page > p {
                            text-align: center;
                            font-size: 14px;
                        }

                        .admin-stats {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 10px;
                        }

                        .admin-stats .analytics-card {
                            min-width: 0;
                            padding: 14px 8px;
                            text-align: center;
                            box-sizing: border-box;
                        }

                        .admin-stats .analytics-card:last-child {
                            grid-column: 1 / -1;
                        }

                        .admin-stats .analytics-card h2 {
                            font-size: 20px;
                            margin: 5px 0;
                            white-space: nowrap;
                        }

                        .admin-stats .analytics-card p {
                            font-size: 13px;
                            margin: 5px 0;
                        }

                        .admin-filters {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 8px;
                            padding: 12px;
                        }

                        .admin-search {
                            grid-column: 1 / -1;
                            width: 100%;
                            min-width: 0;
                        }

                        .admin-filters select,
                        .admin-filters button {
                            width: 100%;
                            min-width: 0;
                            box-sizing: border-box;
                        }

                        .admin-table-wrapper {
                            width: 100%;
                            overflow-x: auto;
                            padding: 10px;
                            box-sizing: border-box;
                        }

                        .admin-table {
                            width: 850px;
                            min-width: 850px;
                            table-layout: fixed;
                        }
                    }
                `}</style>

                <div className="admin-page"></div>

        <div style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "30px auto",
            padding: "20px",
            boxSizing: "border-box",
            minWidth: 0
        }}>

            <h1>
                🛡️ Admin Panel
            </h1>

            <p>
                Manage and review citizen fraud reports.
            </p>

            <div className="admin-stats" >

                <div className="analytics-card">
                    <h2>{totalReports}</h2>
                    <p>Total Reports</p>
                </div>

                <div className="analytics-card">
                    <h2>{pendingReports}</h2>
                    <p>Pending</p>
                </div>

                <div className="analytics-card">
                    <h2>{investigatingReports}</h2>
                    <p>Investigating</p>
                </div>

                <div className="analytics-card">
                    <h2>{resolvedReports}</h2>
                    <p>Resolved</p>
                </div>

                <div className="analytics-card">
                    <h2>₹{totalAmount.toLocaleString("en-IN")}</h2>
                    <p>Amount Reported</p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    padding: "15px",
                    alignItems: "center",
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
                }}
            >
                <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: "1",
                        padding: "10px",
                        minWidth: "200px",
                        boxSizing: "border-box"
                    }}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: "10px"
                    }}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                        padding: "10px"
                    }}
                >
                    <option value="all">All Fraud Types</option>

                    {[...new Set(reports.map((report) => report.fraud_type))]
                        .map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                        padding: "10px"
                    }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>

                <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setSortOrder("newest");
                    }}
                    style={{
                        padding: "10px 15px",
                        cursor: "pointer"
                    }}
                >
                    Clear Filters
                </button>

            </div>

            <div className="admin-table-wrapper">

                <table className="admin-table">

                    <thead>

                        <tr>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "7%"
                            }}>
                                ID
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "15%"
                            }}>
                                Type
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "23%"
                            }}>
                                Description
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "10%"
                            }}>
                                Amount
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "12%"
                            }}>
                                URL
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "13%"
                            }}>
                                Status
                            </th>

                            <th style={{
                                padding: "10px 6px",
                                textAlign: "left",
                                width: "20%"
                            }}>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredReports.map((report) => (

                                <tr
                                    key={report.id}
                                    style={{
                                        borderTop:
                                            "1px solid #eee"
                                    }}
                                >

                                    <td style={{
                                        padding: "10px 6px",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word"
                                    }}>
                                        #{report.id}
                                    </td>


                                    <td style={{
                                        padding: "10px 6px",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word"
                                    }}>
                                        {report.fraud_type}
                                    </td>


                                    <td style={{
                                        padding: "10px 6px",
                                        maxWidth: "300px",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word"
                                    }}>
                                        {report.description}
                                    </td>


                                    <td style={{
                                        padding: "10px 6px",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word"
                                    }}>
                                        ₹{report.amount.toLocaleString()}
                                    </td>


                                    <td style={{
                                        padding: "10px 6px",
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word"
                                    }}>
                                        {report.suspicious_url
                                            || "-"
                                        }
                                    </td>


                                    <td style={{
                                        padding: "12px"
                                    }}>

                                        <strong>
                                            {report.status}
                                        </strong>

                                    </td>


                                    <td style={{
                                        padding: "12px"
                                    }}>

                                        <select
                                            value={report.status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    report.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="investigating">
                                                Investigating
                                            </option>

                                            <option value="resolved">
                                                Resolved
                                            </option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedReport(report)}
                                            style={{
                                                marginLeft: "8px",
                                                padding: "6px 10px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

                <section style={{ marginTop: "40px" }}>
                    <h2>🔍 All Security Scans</h2>

                    <p>
                        View all website and scam message scans performed by citizens.
                    </p>

                    <div style={{ overflowX: "auto", marginTop: "20px" }}>

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>User</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Target</th>
                                    <th style={thStyle}>Result</th>
                                    <th style={thStyle}>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {scans.map((scan) => (
                                    <tr key={scan.id}>

                                        <td style={tdStyle}>
                                            #{scan.id}
                                        </td>

                                        <td style={tdStyle}>
                                            <strong>{scan.user_name}</strong> <br />
                                            <small>{scan.user_email}</small>
                                        </td>

                                        <td style={tdStyle}>
                                            {scan.scan_type === "message"
                                                ? "💬 Message"
                                                : "🔗 Website"}
                                        </td>

                                        <td
                                            style={{
                                                ...tdStyle,
                                                maxWidth: "300px",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {scan.target}
                                        </td>

                                        <td style={tdStyle}>
                                            {scan.result === "safe" && "🟢 Safe"}
                                            {scan.result === "scam" && "🔴 Scam"}
                                            {scan.result === "malicious" && "🔴 Malicious"}
                                            {scan.result === "suspicious" && "🟡 Suspicious"}
                                            {scan.result === "pending" && "🟠 Pending"}
                                        </td>

                                        <td style={tdStyle}>
                                            {scan.created_at
                                                ? new Date(
                                                    scan.created_at
                                                ).toLocaleString("en-IN")
                                                : "-"}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </section>

                {selectedReport && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000
                        }}
                    >
                        <div
                            style={{
                                background: "white",
                                padding: "30px",
                                borderRadius: "12px",
                                width: "90%",
                                maxWidth: "550px",
                                boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
                            }}
                        >
                            <h2>
                                🛡️ Report #{selectedReport.id}
                            </h2>

                            <p>
                                <strong>Fraud Type:</strong>{" "}
                                {selectedReport.fraud_type}
                            </p>

                            <p>
                                <strong>Description:</strong>{" "}
                                {selectedReport.description}
                            </p>

                            <p>
                                <strong>Amount:</strong>{" "}
                                ₹{Number(selectedReport.amount || 0).toLocaleString()}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedReport.status}
                            </p>

                            <p>
                                <strong>Suspicious URL:</strong>{" "}
                                {selectedReport.suspicious_url || "None"}
                            </p>

                            <p>
                                <strong>Created:</strong>{" "}
                                {selectedReport.created_at
                                    ? new Date(selectedReport.created_at).toLocaleString()
                                    : "N/A"}
                            </p>

                            <button
                                onClick={() => setSelectedReport(null)}
                                style={{
                                    marginTop: "15px",
                                    padding: "10px 20px",
                                    cursor: "pointer"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>

        </div>
        </>
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

export default AdminPanel;