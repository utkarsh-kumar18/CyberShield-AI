import { useState } from "react";

function WebsiteScanner() {

    const [url, setUrl] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const scanWebsite = async (e) => {

        e.preventDefault();

        if (!url.trim()) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/scan/url",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        url: url.trim()
                    })
                }
            );

            const data = await response.json();

            setResult(data);

        } catch (error) {

            console.error(error);

            setResult({
                status: "error",
                message: "Unable to connect to CyberShield server."
            });

        } finally {

            setLoading(false);

        }
    };

    return (
        <div style={{
            padding: "40px",
            maxWidth: "900px",
            margin: "auto"
        }}>

            <h1>🔗 Website Scanner</h1>

            <p>
                Check a suspicious website or URL for potential
                cyber threats.
            </p>

            <form onSubmit={scanWebsite}>

                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    style={{
                        width: "70%",
                        padding: "14px",
                        fontSize: "16px",
                        marginRight: "10px"
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: "10px",
                        padding: "14px 22px",
                        cursor: "pointer"
                    }}
                >
                    {loading ? "Scanning..." : "Scan Website"}
                </button>

            </form>


            {result && (

                <div style={{
                    marginTop: "30px",
                    padding: "25px",
                    borderRadius: "12px",
                    background: "#ffffff"
                }}>

                    <h2>Scan Result</h2>

                    <p>
                        <strong>URL:</strong>{" "}
                        {result.url || url}
                    </p>

                    <div
                        style={{
                            marginTop: "20px",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #ddd"
                        }}
                    >
                        <h3>
                            Threat Status
                        </h3>

                        <h2>
                            {result.status === "safe" && "🟢 SAFE"}

                            {result.status === "suspicious" && "🟡 SUSPICIOUS"}

                            {result.status === "malicious" && "🔴 MALICIOUS"}

                            {result.status === "pending" && "🟠 SCAN PENDING"}

                            {result.status === "error" && "⚠️ ERROR"}
                        </h2>

                        <p>
                            {result.message}
                        </p>

                        {result.virustotal && (
                            <div>

                                <h3>
                                    VirusTotal Analysis
                                </h3>

                                <p>
                                    🔴 Malicious:{" "}
                                    {result.virustotal.malicious}
                                </p>

                                <p>
                                    🟡 Suspicious:{" "}
                                    {result.virustotal.suspicious}
                                </p>

                                <p>
                                    🟢 Harmless:{" "}
                                    {result.virustotal.harmless}
                                </p>

                                <p>
                                    ⚪ Undetected:{" "}
                                    {result.virustotal.undetected}
                                </p>

                            </div>
                        )}

                        {result.google_safe_browsing && (
                            <div>
                                <h3>Google Safe Browsing</h3>

                                <p>
                                    {result.google_safe_browsing.status === "safe" && (
                                        <>🟢 Status: Safe</>
                                    )}

                                    {result.google_safe_browsing.status === "unsafe" && (
                                        <>🔴 Status: Unsafe</>
                                    )}

                                    {result.google_safe_browsing.status === "error" && (
                                        <>⚠️ Unable to check</>
                                    )}

                                    {result.google_safe_browsing.status === "not_checked" && (
                                        <>⚪ Not Checked</>
                                    )}
                                </p>

                                <p>
                                    Threats:{" "}
                                    {result.google_safe_browsing.threats &&
                                    result.google_safe_browsing.threats.length > 0
                                        ? result.google_safe_browsing.threats.length
                                        : "None"}
                                </p>
                            </div>
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default WebsiteScanner;