import { useLocation, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../auth/useAuth";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = useAuth();

  return (
    <aside className="sidebar">
      <div className="logo">
        <Shield className="logo-icon"/>
        <span>CyberShield</span>
      </div>

      <nav>
        <a
          className={location.pathname === "/" ? "active" : ""}
          onClick={() => navigate("/")}
        >
          Dashboard
        </a>

        <a
          className={location.pathname === "/url-scanner" ? "active" : ""}
          onClick={() => navigate("/url-scanner")}
        >
          URL Scanner
        </a>

        <a
          className={location.pathname === "/message-scanner" ? "active" : ""}
          onClick={() => navigate("/message-scanner")}
        >
          Message Scanner
        </a>

        <a
          className={location.pathname === "/report-fraud" ? "active" : ""}
          onClick={() => navigate("/report-fraud")}
        >
          Report Fraud
        </a>

        <a
          className={location.pathname === "/fraud-intelligence" ? "active" : ""}
          onClick={() => navigate("/fraud-intelligence")}
        >
          Fraud Intelligence
        </a>

        <a 
        className={location.pathname==="/scan-history"? "active":""}
        onClick={() => navigate("/scan-history")}>
          Scan History
          </a>
      </nav>

      <div className="sidebar-bottom">
        <a
          className={location.pathname === "/account" ? "active" : ""}
          href="/account"
          onClick={(event) => { event.preventDefault(); navigate("/account"); }}
        >
          {email ? "Account" : "Sign in / Create account"}
        </a>
        <a
        className={location.pathname === "/settings" ? "active" : ""}
       onClick={() => navigate("/settings")}

        >
        Settings
        </a>
        <a
         className={location.pathname === "/help-support" ? "active" : ""}
        onClick={() => navigate("/help-support")}
        >
          Help & Support
          </a>
      </div>
    </aside>
  );
}

export default Sidebar;
