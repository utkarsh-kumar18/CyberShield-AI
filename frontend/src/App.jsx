import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./pages/Home";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Navigation() {
    return null;
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
                    path="/my-report"
                    element={
                        <ProtectedRoute>
                            <MyReports />
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

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;