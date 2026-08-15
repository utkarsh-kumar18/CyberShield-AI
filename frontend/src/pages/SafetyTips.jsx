import { useState } from "react";
import { apiFetch } from "../utils/api";

function SafetyTips() {

    const [selectedCategory, setSelectedCategory] =
        useState(null);

    const tips = {

        "Banking & UPI": [
            "Never share your UPI PIN with anyone.",
            "Banks never ask for your OTP, PIN or CVV over phone calls.",
            "Verify the recipient's name before approving a UPI payment.",
            "Never approve an unknown UPI collect request.",
            "Contact your bank immediately if you notice an unauthorized transaction."
        ],

        "OTP & SIM Scams": [
            "Never share an OTP with anyone, even if they claim to be from your bank.",
            "Do not share SIM verification codes with unknown callers.",
            "If your phone suddenly loses network, contact your mobile operator.",
            "Avoid clicking links asking you to verify your SIM or mobile number."
        ],

        "Phishing Websites": [
            "Check the website address carefully before entering sensitive information.",
            "Look for HTTPS, but remember that HTTPS alone does not guarantee a website is safe.",
            "Avoid links received from unknown emails or messages.",
            "Never enter banking credentials on suspicious websites.",
            "Use CyberShield AI Website Scanner before visiting a suspicious URL."
        ],

        "Job Scams": [
            "Never pay money to receive a job offer.",
            "Be careful with work-from-home offers promising unusually high salaries.",
            "Verify the company through its official website.",
            "Never share banking passwords or OTPs with recruiters.",
            "Avoid downloading unknown applications sent by recruiters."
        ],

        "Online Shopping": [
            "Buy from trusted websites and verified sellers.",
            "Be suspicious of deals that are dramatically cheaper than normal.",
            "Avoid making payments through unknown payment links.",
            "Check the website domain before entering card details.",
            "Keep order confirmations and payment receipts."
        ],

        "Investment Scams": [
            "Be suspicious of guaranteed or extremely high returns.",
            "Never transfer money to an investment account you cannot verify.",
            "Verify investment companies with official regulatory sources.",
            "Do not trust investment advice received from random social-media accounts.",
            "Never share your banking OTP or UPI PIN for an investment."
        ],

        "Email Phishing": [
            "Check the sender's email address carefully.",
            "Do not open unexpected attachments.",
            "Hover over links before clicking them.",
            "Never provide passwords through email links.",
            "When in doubt, visit the organization's official website directly."
        ],

        "Social Media": [
            "Do not share personal information publicly.",
            "Enable two-factor authentication on important accounts.",
            "Ignore messages asking for money from unknown accounts.",
            "Be careful with fake profiles and impersonation accounts.",
            "Never share OTPs or account recovery codes."
        ]

    };

    return (

        <div style={{
            maxWidth: "1100px",
            margin: "30px auto",
            padding: "20px"
        }}>

            <h1>
                🛡️ Safety Tips
            </h1>

            <p>
                Practical guidance to help protect yourself
                from common cyber threats and fraud.
            </p>


            {/* Categories */}

            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "30px",
                marginBottom: "30px"
            }}>

                {Object.keys(tips).map(
                    (category) => (

                        <button
                            key={category}
                            onClick={() =>
                                setSelectedCategory(category)
                            }
                            style={{
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                cursor: "pointer",
                                background:
                                    selectedCategory === category
                                        ? "#2563eb"
                                        : "#ffffff",
                                color:
                                    selectedCategory === category
                                        ? "#ffffff"
                                        : "#000000"
                            }}
                        >
                            {category}
                        </button>

                    )
                )}

            </div>

        {/* Selected Category */}

            {selectedCategory && (

                <div style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "30px",
                    boxShadow:
                        "0 2px 10px rgba(0,0,0,0.1)"
                }}>

                    <h2>
                        {selectedCategory}
                    </h2>

                    <div>

                        {tips[selectedCategory].map(
                            (tip, index) => (

                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        gap: "15px",
                                        padding: "15px 0",
                                        borderBottom:
                                            index !==
                                            tips[selectedCategory].length - 1
                                                ? "1px solid #eee"
                                                : "none"
                                    }}
                                >

                                    <span style={{
                                        fontSize: "20px"
                                    }}>
                                        🛡️
                                    </span>

                                    <span>
                                        {tip}
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

)}
        </div>
    );
}

export default SafetyTips;