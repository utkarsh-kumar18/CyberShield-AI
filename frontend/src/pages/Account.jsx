
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Account() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { authenticate, email: signedInEmail, logout } = useAuth();
  const navigate = useNavigate();

  const isRegister = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await authenticate(email.trim(), password, isRegister);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setError("");
    setMode((current) => current === "login" ? "register" : "login");
  };

  if (signedInEmail) {
    return (
      <main className="account-page">
        <div className="account-shell account-signed-in">
          <div className="account-brand">
            <span className="account-brand-icon" aria-hidden="true">🛡</span>
            <span>CyberShield<span className="account-brand-dot">.</span></span>
          </div>

          <section className="account-card account-profile-card">
            <div className="account-success-icon" aria-hidden="true">✓</div>
            <span className="account-eyebrow">ACCOUNT OVERVIEW</span>
            <h1>Your account</h1>
            <p className="account-description">
              You’re signed in and ready to review your saved security activity.
            </p>

            <div className="account-profile-info">
              <span className="account-profile-avatar" aria-hidden="true">
                {signedInEmail.charAt(0).toUpperCase()}
              </span>
              <div>
                <span className="account-field-caption">SIGNED IN AS</span>
                <strong>{signedInEmail}</strong>
              </div>
              <span className="account-online-dot" title="Signed in" />
            </div>

            <div className="account-profile-actions">
              <Link className="account-primary-button" to="/scan-history">
                View scan history <span aria-hidden="true">→</span>
              </Link>
              <button
                className="account-secondary-button"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                Sign out
              </button>
            </div>

            <p className="account-footnote">
              Keep your account credentials private and secure.
            </p>
          </section>

          <p className="account-footer">
            CyberShield AI · Citizen security awareness platform
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-topbar">
          <Link className="account-brand" to="/" aria-label="CyberShield home">
            <span className="account-brand-icon" aria-hidden="true">🛡</span>
            <span>CyberShield<span className="account-brand-dot">.</span></span>
          </Link>

          <Link className="account-back-link" to="/">
            <span aria-hidden="true">←</span> Back to dashboard
          </Link>
        </header>

        <div className="account-layout">
          <section className="account-intro">
            <span className="account-intro-badge">
              <span className="account-live-dot" />
              YOUR DIGITAL SAFETY SPACE
            </span>

            <h1>
              Stay alert.
              <br />
              Stay <span>protected.</span>
            </h1>

            <p className="account-intro-description">
              Keep your security activity organized. Sign in to access your
              saved scans and review your CyberShield history.
            </p>

            <div className="account-feature-list">
              <div className="account-feature">
                <span className="account-feature-icon" aria-hidden="true">⌕</span>
                <div>
                  <strong>Scan with confidence</strong>
                  <p>Review saved URL and message scan results.</p>
                </div>
              </div>

              <div className="account-feature">
                <span className="account-feature-icon" aria-hidden="true">▤</span>
                <div>
                  <strong>Keep track of activity</strong>
                  <p>Access your saved scans and submitted reports.</p>
                </div>
              </div>

              <div className="account-feature">
                <span className="account-feature-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>Make informed decisions</strong>
                  <p>Use risk assessments to help spot suspicious content.</p>
                </div>
              </div>
            </div>

            <div className="account-security-note">
              <span className="account-security-icon" aria-hidden="true">🔒</span>
              <p>
                <strong>Security starts with awareness.</strong>
                <br />
                Never share your password with anyone.
              </p>
            </div>
          </section>

          <section className="account-card">
            <div className="account-card-heading">
              <span className="account-eyebrow">
                {isRegister ? "GET STARTED" : "WELCOME BACK"}
              </span>

              <h2>{isRegister ? "Create your account" : "Sign in to CyberShield"}</h2>

              <p>
                {isRegister
                  ? "Create an account to keep track of your scans."
                  : "Enter your details to access your saved security activity."}
              </p>
            </div>

            <div className="account-mode-switch" aria-label="Account access mode">
              <button
                type="button"
                className={!isRegister ? "active" : ""}
                aria-pressed={!isRegister}
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
              >
                Sign in
              </button>

              <button
                type="button"
                className={isRegister ? "active" : ""}
                aria-pressed={isRegister}
                onClick={() => {
                  setError("");
                  setMode("register");
                }}
              >
                Create account
              </button>
            </div>

            <form className="account-form" onSubmit={handleSubmit}>
              <div className="account-form-group">
                <label htmlFor="account-email">Email address</label>
                <div className="account-input-wrap">
                  <span className="account-input-icon" aria-hidden="true">@</span>
                  <input
                    id="account-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={320}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div className="account-form-group">
                <label htmlFor="account-password">Password</label>
                <div className="account-input-wrap">
                  <span className="account-input-icon" aria-hidden="true">⌑</span>
                  <input
                    id="account-password"
                    type="password"
                    name="password"
                    placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    minLength={isRegister ? 8 : 1}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                {isRegister && (
                  <span className="account-field-hint">
                    Use at least 8 characters.
                  </span>
                )}
              </div>

              {error && (
                <div className="account-error" role="alert">
                  <span aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                className="account-primary-button account-submit"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : isRegister
                    ? "Create account"
                    : "Sign in"}
                {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="account-switch-prompt">
              {isRegister ? "Already have an account?" : "New to CyberShield?"}
              {" "}
              <button type="button" onClick={switchMode}>
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </div>

            <div className="account-card-divider">
              <span />
              <span>CYBERSHIELD AI</span>
              <span />
            </div>

            <p className="account-disclaimer">
              CyberShield is an independent security awareness platform,
              not a government emergency reporting portal.
            </p>
          </section>
        </div>

        <footer className="account-footer">
          <span>© CyberShield AI</span>
          <span>Stay informed. Stay safe.</span>
        </footer>
      </div>
    </main>
  );
}

export default Account;
