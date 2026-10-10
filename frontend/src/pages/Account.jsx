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

  if (signedInEmail) {
    return (
      <main className="auth-page">
        <section className="report-card auth-card">
          <h1>Your CyberShield account</h1>
          <p>Signed in as <strong>{signedInEmail}</strong>. Scans are saved to this account.</p>
          <button className="primary-btn" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
        </section>
      </main>
    );
  }

  const isRegister = mode === "register";
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authenticate(email.trim(), password, isRegister);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="report-card auth-card">
        <h1>{isRegister ? "Create your account" : "Sign in"}</h1>
        <p>Sign in to securely save scans and view your scan history.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="account-email">Email</label>
            <input id="account-email" type="email" autoComplete="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="account-password">Password</label>
            <input id="account-password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="report-submit-btn" type="submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already have an account? " : "New to CyberShield? "}
          <button className="text-btn" type="button" onClick={() => { setError(""); setMode(isRegister ? "login" : "register"); }}>
            {isRegister ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="auth-note">CyberShield is an independent service and is not a government emergency reporting portal.</p>
        <Link to="/">Back to dashboard</Link>
      </section>
    </main>
  );
}

export default Account;
