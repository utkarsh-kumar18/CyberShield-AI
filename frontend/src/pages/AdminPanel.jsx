import { useEffect, useState } from "react";

function AdminPanel() {

    const [reports, setReports] = useState([]);
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
                        "Content-Type":
                            "application/json"
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

                alert(data.message);

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

        <div style={{
            maxWidth: "1200px",
            margin: "30px auto",
            padding: "20px"
        }}>

            <h1>
                🛡️ Admin Panel
            </h1>

            <p>
                Manage and review citizen fraud reports.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "15px",
                    marginTop: "25px"
                }}
            >
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

            <div style={{
                marginTop: "30px",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow:
                    "0 2px 10px rgba(0,0,0,0.1)",
                overflowX: "auto"
            }}>

                <table style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}>

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
                                Description
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
                                URL
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
                                        padding: "12px",
                                        maxWidth: "300px"
                                    }}>
                                        {report.description}
                                    </td>


                                    <td style={{
                                        padding: "12px"
                                    }}>
                                        ₹{report.amount.toLocaleString()}
                                    </td>


                                    <td style={{
                                        padding: "12px"
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
    );
}

export default AdminPanel;