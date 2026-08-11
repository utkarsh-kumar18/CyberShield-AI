import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [totalScans, setTotalScans] = useState(0);
    const [threatsDetected, setThreatsDetected] = useState(0);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:5000/api/fraud/my-reports", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    console.log("Reports:", data.reports);
                    setReports(data.reports);
                }
            })
            .catch((error) => {
                console.error("Failed to load reports:", error);
            });

        fetch("http://127.0.0.1:5000/api/scan/my-scans", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {

                    // Total scans
                    setTotalScans(data.count);

                    // Count detected threats
                    const threats = data.scans.filter((scan) => {
                        const result = String(scan.result).toLowerCase();

                        return (
                            result === "malicious" ||
                            result === "suspicious" ||
                            result === "scam"
                        );
                    });

                    setThreatsDetected(threats.length);
                }
            })
            .catch((error) => {
                console.error("Failed to load scans:", error);
            });

    }, []);

    const reportsCount = reports.length;
    const threatsCount = reports.filter(
        (report) => report.status !== "resolved"
    ).length;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="dashboard">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="logo">
                    🛡️ CyberShield
                    <span> AI</span>
                </div>

                <nav className="side-nav">

                    <button className="active">
                       🏠 Dashboard
                    </button>

                    <button onClick={() => navigate("/scanner")}>
                        🔗 Website Scanner
                    </button>

                    <button onClick={() => navigate("/message-scanner")}>
                        💬 Scam Message
                    </button>

                    <button onClick={() => navigate("/report-fraud")}>
                        🚨 Report Fraud
                    </button>

                    <button onClick={() => navigate("/threat-analytics")}>
                        📊 Threat Analytics
                    </button>

                    <button onClick={() => navigate("/safety-tips")}>
                        🛡️ Safety Tips
                    </button>

                    <button onClick={() =>  navigate("/my-scans")}>
                        🔍 Scan History
                    </button>

                </nav>

                <button
                    className="logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* Main Content */}
            <main className="main-content">

                {/* Header */}
                <header className="dashboard-header">

                    <div>
                        <h1>Security Dashboard</h1>

                        <p>
                            Welcome back, {user?.name || "Citizen"}
                        </p>
                    </div>

                    <div className="profile">

                        <div className="avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <small>
                                {user?.role || "Citizen"}
                            </small>
                        </div>

                    </div>

                </header>


                {/* Welcome Banner */}
                <section className="welcome-banner">

                    <div>

                        <h2>
                            Stay Safe. Stay Protected. 🛡️
                        </h2>

                        <p>
                            CyberShield AI helps you detect suspicious
                            websites, scam messages and cyber fraud.
                        </p>

                    </div>

                    <div className="shield-icon">
                        🛡️
                    </div>

                </section>


                {/* Statistics */}
                <section className="stats">

                    <div className="stat-card">
                        <span>🔍</span>
                        <div>
                            <h3>{totalScans}</h3>
                            <p>Total Scans</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span>⚠️</span>
                        <div>
                            <h3>{threatsDetected}</h3>
                            <p>Threats Detected</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span>🚨</span>
                        <div>
                            <h3>{reportsCount}</h3>
                            <p>Reports Submitted</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span>🛡️</span>
                        <div>
                            <h3>
                                {threatsDetected > 0 
                                ? "Threat Detected" 
                                : "Safe"}
                            </h3>
                            <p>Current Status</p>
                        </div>
                    </div>

                </section>


                {/* Security Tools */}
                <section>

                    <div className="section-title">

                        <h2>
                            Security Tools
                        </h2>

                        <p>
                            Analyze potential cyber threats
                        </p>

                    </div>


                    <div className="tools-grid">

                        <div
                            className="tool-card"
                            onClick={() => navigate("/scanner")}
                        >

                            <div className="tool-icon">
                                🔗
                            </div>

                            <h3>
                                Website Scanner
                            </h3>

                            <p>
                                Check suspicious URLs and websites
                                for possible threats.
                            </p>

                            <button>
                                Scan Website →
                            </button>

                        </div>


                        <div
                            className="tool-card"
                            onClick={() => navigate("/message-scanner")}
                        >

                            <div className="tool-icon">
                                💬
                            </div>

                            <h3>
                                Scam Message Detector
                            </h3>

                            <p>
                                Analyze SMS, WhatsApp and email
                                messages for scam patterns.
                            </p>

                            <button>
                                Analyze Message →
                            </button>

                        </div>


                        <div
                            className="tool-card"
                            onClick={() =>
                                alert("Fraud reporting — coming next!")
                            }
                        >

                            <div className="tool-icon">
                                🚨
                            </div>

                            <h3>
                                Report Cyber Fraud
                            </h3>

                            <p>
                                Report suspicious activities and
                                cyber fraud incidents.
                            </p>

                            <button>
                                Report Incident →
                            </button>

                        </div>

                    </div>

                </section>


                {/* Recent Activity */}
                <section className="activity-section">

                    <div className="section-title">

                        <h2>
                            Recent Activity
                        </h2>

                        <p>
                            Your latest security activity
                        </p>

                    </div>

                    <div className="empty-activity">

                        <div>
                            🔍
                        </div>

                        <h3>
                            No activity yet
                        </h3>

                        <p>
                            Your scans and reports will appear here.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;