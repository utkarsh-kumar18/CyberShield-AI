import { useState } from "react";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("Creating account...");

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMessage(
                    "Registration successful! You can now login."
                );

                setName("");
                setEmail("");
                setPassword("");

            } else {

                setMessage(
                    data.message || "Registration failed"
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

            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>

                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Enter your name"
                        required
                    />
                </div>

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
                        placeholder="Create a password"
                        required
                    />
                </div>

                <button type="submit">
                    Register
                </button>

            </form>

            <p>{message}</p>

        </div>
    );
}

export default Register;