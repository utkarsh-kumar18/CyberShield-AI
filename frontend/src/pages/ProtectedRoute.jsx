import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;