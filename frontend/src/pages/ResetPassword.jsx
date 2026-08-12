import { useState } from "react";
import "./ResetPassword.css";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const resetToken = localStorage.getItem("resetToken");

        if (!resetToken) {
            setError(
                "Reset session expired. Please start again."
            );
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/reset-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${resetToken}`
                    },

                    body: JSON.stringify({
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem("resetToken");

                setMessage(
                    "Password reset successful! Redirecting to login..."
                );

                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);

            } else {
                setError(
                    data.message || "Password reset failed."
                );
            }

        } catch (error) {
            console.error(error);

            setError(
                "Unable to connect to server."
            );
        }
    };

    return (
        <div className="reset-page">

            <div className="reset-card">

                <div className="reset-logo">
                    🛡️
                </div>

                <h1>Create New Password</h1>

                <p className="reset-subtitle">
                    Create a new secure password for your account.
                </p>

                <form onSubmit={handleReset}>

                    {/* New Password */}

                    <div className="reset-input-group">

                        <label>
                            New Password
                        </label>

                        <div className="reset-input-wrapper">

                            <span className="reset-input-icon">
                                🔒
                            </span>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter new password"
                                required
                            />

                            <button
                                type="button"
                                className="reset-password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* Confirm Password */}

                    <div className="reset-input-group">

                        <label>
                            Confirm Password
                        </label>

                        <div className="reset-input-wrapper">

                            <span className="reset-input-icon">
                                🔒
                            </span>

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm your password"
                                required
                            />

                            <button
                                type="button"
                                className="reset-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="reset-submit-button"
                    >
                        Reset Password →
                    </button>

                </form>


                {message && (
                    <p className="reset-success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="reset-error">
                        {error}
                    </p>
                )}


                <a
                    href="/login"
                    className="reset-back-login"
                >
                    ← Back to Login
                </a>

            </div>

        </div>
    );
}

export default ResetPassword;