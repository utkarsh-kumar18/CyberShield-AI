import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

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

function Home() {
    return (
        <div>
            <h1>CyberShield AI</h1>

            <p>National Citizen Safety Platform</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>

            <nav>
                <Link to="/">Home</Link>
                {" | "}
                <Link to="/login">Login</Link>
                {" | "}
                <Link to="/register">Register</Link>
            </nav>

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
                    element={<Dashboard />}
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
                        <ProtectedRoute>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                <Route path="/my-reports" element={<MyReports />} />

            </Routes>

        </BrowserRouter>
    );
}

export default App;