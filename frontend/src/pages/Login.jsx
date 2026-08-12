import { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("Logging in...");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                window.location.href = "/dashboard";
            } else {
                setMessage(
                    data.message || "Login failed"
                );
            }

        } catch (error) {
            console.error(error);

            setMessage(
                "Unable to connect to server"
            );
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* Logo */}
                <div className="login-logo">
                    <span className="shield-icon">🛡️</span>
                    <span>
                        CyberShield <b>AI</b>
                    </span>
                </div>

                <h1>Welcome Back</h1>

                <p className="login-subtitle">
                    Sign in to your security dashboard
                </p>

                <form onSubmit={handleLogin}>

                    {/* Email */}
                    <div className="input-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                    </div>

                    {/* Password */}
                    <div className="input-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>

                    <div className="forgot-password">
                        <a href="/forgot-password">
                                Forfot Password ?
                        </a>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        className="login-button"
                    >
                        Login →
                    </button>

                </form>

                {/* Message */}
                {message && (
                    <p className="login-message">
                        {message}
                    </p>
                )}

                {/* Register */}
                <div className="register-section">
                    <span>Don't have an account?</span>

                    <a href="/register">
                        Create Account
                    </a>
                </div>

                <div className="security-note">
                    🛡️ Your security is our priority
                </div>

            </div>

        </div>
    );
}

export default Login;