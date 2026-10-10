import { useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { AuthContext } from "./context";
const SESSION_KEY = "cybershield.session";

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const authenticate = async (email, password, createAccount) => {
    const result = await apiRequest(createAccount ? "/users/register" : "/users/login", {
      body: { email, password },
    });
    const nextSession = { token: result.token, email: result.email };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const value = useMemo(() => ({
    email: session?.email || null,
    token: session?.token || null,
    authenticate,
    logout,
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
