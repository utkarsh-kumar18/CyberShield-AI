import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [recentScans, setRecentScans] = useState([]);
    const [totalScans, setTotalScans] = useState(0);
    const [threatsDetected, setThreatsDetected] = useState(0);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        apiFetch("/api/fraud/my-reports")
            .then((response) => {
                if (!response) return null;
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    setReports(data.reports);
                }
            })
            .catch((error) => {
                console.error("Failed to load reports:", error);
            });

        apiFetch("/api/scan/my-scans")
            .then((response) => {
                if (!response) return null;
                return response.json();
            })
            .then((data) => {
                if (!data) return;

                if (data.status === "success") {

                    // Total scans
                    setTotalScans(data.count);

                    setRecentScans(data.scans.slice(0, 3));

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

                     <button onClick={() => navigate("/my-report")}>
                        📋 My Reports
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

                    {user?.role === "admin" && (
                        <button onClick={() => navigate("/admin")}>
                            👨‍💼 Admin Panel
                        </button>
                    )}

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

                            <h3>Website Scanner</h3>

                            <p> Check suspicious URLs and websites for possible threats.</p>

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
                            onClick={() => navigate("/report-fraud")}
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

                        <h2>Recent Activity</h2>

                        <p>Your latest security activity</p>

                    </div>

                    <div className="empty-activity">

                        {recentScans.length === 0 ? (
                            <>
                                <span>🔍</span>
                                <h3>No activity yet</h3>
                                <p>Your scans and reports will appear here.</p>
                            </>
                        ) : (
                            <div className="activity-list">
                                {recentScans.map((scan) => (
                                    <div className="activity-item" key={scan.id}>

                                        <span className="activity-icon">
                                            {scan.scan_type === "message" ? "💬" : "🔗"}
                                        </span>

                                        <div className="activity-details">
                                            <h3>
                                                {scan.scan_type === "message"
                                                    ? "Scam Message Scan"
                                                    : "Website Scan"}
                                            </h3>

                                            <p>{scan.target}</p>

                                            <small>
                                                {new Date(scan.created_at).toLocaleString("en-IN")}
                                            </small>
                                        </div>

                                        <div className="activity-result">
                                            {scan.result === "safe" && "🟢 Safe"}
                                            {scan.result === "scam" && "🔴 Scam"}
                                            {scan.result === "malicious" && "🔴 Malicious"}
                                            {scan.result === "suspicious" && "🟡 Suspicious"}
                                            {scan.result === "pending" && "🟠 Pending"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;