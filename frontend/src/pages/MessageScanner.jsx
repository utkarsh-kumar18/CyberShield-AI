import { useState } from "react";

function MessageScanner() {

    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const scanMessage = async (e) => {

        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://127.0.0.1:5000/api/scan/message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: message.trim()
                    })
                }
            );

            const data = await response.json();

            setResult(data);

        } catch (error) {

            console.error(error);

            setResult({
                status: "error",
                result: "Unable to connect to CyberShield server."
            });

        } finally {

            setLoading(false);

        }
    };

    return (
        <div style={{
            maxWidth: "900px",
            margin: "40px auto",
            padding: "20px"
        }}>

            <h1>💬 Scam Message Detector</h1>

            <p>
                Analyze SMS, WhatsApp or email messages
                for possible scam patterns.
            </p>

            <form onSubmit={scanMessage}>

                <textarea
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    placeholder="Paste a suspicious message here..."
                    rows="8"
                    style={{
                        width: "100%",
                        padding: "15px",
                        fontSize: "16px",
                        resize: "vertical"
                    }}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: "15px",
                        padding: "12px 25px",
                        cursor: "pointer"
                    }}
                >
                    {loading
                        ? "Analyzing..."
                        : "Analyze Message"
                    }
                </button>

            </form>


            {result && (

                <div style={{
                    marginTop: "30px",
                    padding: "25px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    border: "1px solid #ddd"
                }}>

                    <h2>
                        Analysis Result
                    </h2>

                    <h3>

                        {result.status === "scam" &&
                            "🔴 SCAM DETECTED"
                        }

                        {result.status === "safe" &&
                            "🟢 LIKELY SAFE"
                        }

                        {result.status === "error" &&
                            "⚠️ ERROR"
                        }

                    </h3>

                    <p>
                        <strong>Confidence:</strong>{" "}
                        {result.confidence}%
                    </p>

                    <p>
                        {result.result}
                    </p>

                </div>

            )}

        </div>
    );
}

export default MessageScanner;
