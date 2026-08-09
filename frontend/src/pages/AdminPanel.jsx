import { useEffect, useState } from "react";

function AdminPanel() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

                        {reports.map(
                            (report) => (

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

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default AdminPanel;