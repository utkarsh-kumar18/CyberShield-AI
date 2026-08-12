import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            {/* Navbar */}
            <nav className="home-navbar">

                <div className="home-logo">
                    <span>🛡️</span>
                    CyberShield <b>AI</b>
                </div>

                <div className="home-nav-buttons">
                    <a href="/login" className="nav-login">
                        Login
                    </a>

                    <a href="/register" className="nav-register">
                        Get Started
                    </a>
                </div>

            </nav>


            {/* Hero Section */}
            <section className="hero-section">

                <div className="hero-content">

                    <div className="hero-badge">
                        🛡️ AI-Powered Citizen Safety
                    </div>

                    <h1>
                        Stay Safe.
                        <br />
                        <span>Stay Protected.</span>
                    </h1>

                    <p>
                        CyberShield AI is a national citizen safety
                        platform designed to detect cyber fraud,
                        suspicious websites, scam messages and
                        online threats.
                    </p>

                    <div className="hero-buttons">

                        <a
                            href="/login"
                            className="hero-primary"
                        >
                            Login to Dashboard →
                        </a>

                        <a
                            href="/register"
                            className="hero-secondary"
                        >
                            Create Account
                        </a>

                    </div>

                </div>


                {/* Shield */}
                <div className="hero-shield">

                    <div className="shield-circle">
                        🛡️
                    </div>

                    <div className="floating-card card-one">
                        🔗 Website Scanner
                    </div>

                    <div className="floating-card card-two">
                        💬 Scam Detector
                    </div>

                    <div className="floating-card card-three">
                        🚨 Fraud Protection
                    </div>

                </div>

            </section>


            {/* Features */}
            <section className="features-section">

                <div className="section-heading">

                    <h2>
                        Powerful Security Tools
                    </h2>

                    <p>
                        Everything you need to stay protected
                        from modern cyber threats.
                    </p>

                </div>


                <div className="features-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔗
                        </div>

                        <h3>Website Scanner</h3>

                        <p>
                            Analyze suspicious URLs using
                            VirusTotal and Google Safe Browsing.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            💬
                        </div>

                        <h3>Scam Message Detector</h3>

                        <p>
                            Detect potential scam messages
                            using AI-powered analysis.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            🚨
                        </div>

                        <h3>Fraud Reporting</h3>

                        <p>
                            Report cyber fraud incidents and
                            help build a safer digital community.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            📊
                        </div>

                        <h3>Threat Analytics</h3>

                        <p>
                            Monitor security threats and gain
                            useful cyber intelligence.
                        </p>

                    </div>

                </div>

            </section>


            {/* CTA */}
            <section className="home-cta">

                <h2>
                    Ready to stay protected?
                </h2>

                <p>
                    Create your CyberShield AI account today.
                </p>

                <a
                    href="/register"
                    className="cta-button"
                >
                    Get Started →
                </a>

            </section>


            {/* Footer */}
            <footer className="home-footer">

                <div>
                    🛡️ <b>CyberShield AI</b>
                </div>

                <p>
                    National Citizen Safety Platform
                </p>

                <small>
                    © 2026 CyberShield AI. All rights reserved.
                </small>

            </footer>

        </div>
    );
}

export default Home;