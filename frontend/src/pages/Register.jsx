import { useState } from "react";
import "./Register.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(
                    "Account created successfully! Redirecting to login..."
                );

                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);

            } else {
                setError(
                    data.message || "Registration failed."
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
        <div className="register-page">

            <div className="register-card">

                {/* Logo */}

                <div className="register-brand">
                    <div className="register-shield">
                        🛡️
                    </div>

                    <h1>
                        CyberShield <span>AI</span>
                    </h1>
                </div>


                <h2>Create Your Account</h2>

                <p className="register-subtitle">
                    Join CyberShield AI and stay protected
                    from cyber threats.
                </p>


                <form onSubmit={handleRegister}>

                    {/* Name */}

                    <div className="register-input-group">

                        <label>
                            Full Name
                        </label>

                        <div className="register-input-wrapper">

                            <span className="register-input-icon">
                                👤
                            </span>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your full name"
                                required
                            />

                        </div>

                    </div>


                    {/* Email */}

                    <div className="register-input-group">

                        <label>
                            Email Address
                        </label>

                        <div className="register-input-wrapper">

                            <span className="register-input-icon">
                                ✉️
                            </span>

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

                    </div>


                    {/* Password */}

                    <div className="register-input-group">

                        <label>
                            Password
                        </label>

                        <div className="register-input-wrapper">

                            <span className="register-input-icon">
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
                                placeholder="Create a password"
                                required
                                minLength="6"
                            />

                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* Register button */}

                    <button
                        type="submit"
                        className="register-submit-button"
                    >
                        Create Account →
                    </button>

                </form>


                {/* Messages */}

                {message && (
                    <p className="register-success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="register-error">
                        {error}
                    </p>
                )}


                {/* Login */}

                <div className="register-login-section">

                    <span>
                        Already have an account?
                    </span>

                    <a href="/login">
                        Login
                    </a>

                </div>


                <div className="register-security">

                    🛡️ Your security is our priority

                </div>

            </div>

        </div>
    );
}

export default Register;