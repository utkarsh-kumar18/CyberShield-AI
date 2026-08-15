import { useState } from "react";
import "./ForgotPassword.css";
import { apiFetch } from "../utils/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(
                    "resetToken",
                    data.reset_token
                );
                window.location.href = "/reset-password";
            } else {
                setError(
                    data.message || "Account not found."
                );
            }

        } catch (error) {
            console.error(error);
            setError("Unable to connect to server.");
        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-card">

                <div className="forgot-logo">
                    🛡️
                </div>

                <h1>Forgot Password?</h1>

                <p className="forgot-subtitle">
                    Enter your registered email address to reset
                    your password.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="forgot-input-group">

                        <label>Email Address</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email address"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="reset-button"
                    >
                        Continue →
                    </button>

                </form>

                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <a
                    href="/login"
                    className="back-login"
                >
                    ← Back to Login
                </a>

            </div>

        </div>
    );
}

export default ForgotPassword;