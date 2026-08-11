import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useLocation
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import WebsiteScanner from "./pages/WebsiteScanner";
import MessageScanner from "./pages/MessageScanner";
import ReportFraud from "./pages/ReportFraud";
import ThreatAnalytics from "./pages/ThreatAnalytics";
import SafetyTips from "./pages/SafetyTips";
import AdminPanel from "./pages/AdminPanel";
import MyReports from "./pages/MyReports";
import MyScans from "./pages/MyScans";

function Home() {
    return (
        <div>
            <h1>CyberShield AI</h1>

            <p>National Citizen Safety Platform</p>
        </div>
    );
}

function Navigation() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (location.pathname === "/dashboard") {
        return null;
    }

    return (
        <nav>
            <Link to="/">Home</Link>

            {token ? (
                <>
                    {" | "}
                    <Link to="/dashboard">Dashboard</Link>

                    {" | "}
                    <Link to="/report-fraud">Report Fraud</Link>

                    {" | "}
                    <Link to="/my-reports">My Reports</Link>

                    {user.role === "admin" && (
                        <>
                            {" | "}
                            <Link to="/admin">Admin Panel</Link>
                        </>
                    )}

                    {" | "}
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            window.location.href = "/login";
                        }}
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    {" | "}
                    <Link to="/login">Login</Link>

                    {" | "}
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>

            <Navigation />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route 
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                />

                <Route
                    path="/scanner"
                    element={
                        <ProtectedRoute>
                            <WebsiteScanner/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/message-scanner"
                    element={
                        <ProtectedRoute>
                            <MessageScanner />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/report-fraud"
                    element={
                        <ProtectedRoute>
                            <ReportFraud />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/threat-analytics"
                    element={
                        <ProtectedRoute>
                            <ThreatAnalytics />
                        </ProtectedRoute>
                    } 
                />

                <Route
                    path="/safety-tips"
                    element={
                        <ProtectedRoute>
                            <SafetyTips />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/my-reports" 
                    element={
                        <ProtectedRoute>
                          <MyReports/>
                        </ProtectedRoute>
                    }
                />  

                <Route
                    path="/my-scans"
                    element={
                        <ProtectedRoute>
                            <MyScans />
                        </ProtectedRoute>
                    }
                />  

            </Routes>

        </BrowserRouter>
    );
}

export default App;