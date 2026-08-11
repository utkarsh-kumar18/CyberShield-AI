import { useState } from "react";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

                console.log("Login successful:", data);

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                window.location.href = "/dashboard";

                setMessage("Login successful!");

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
        <div>

            <h1>CyberShield AI</h1>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit">
                    Login
                </button>

            </form>

            <p>{message}</p>

        </div>
    );
}

export default Login;