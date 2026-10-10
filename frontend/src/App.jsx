import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import URLScanner from "./pages/URLScanner";
import URLResult from "./pages/URLResult";
import ScanHistory from "./pages/ScanHistory";
import MessageScanner from "./pages/MessageScanner";
import MessageResult from "./pages/MessageResult";
import ReportFraud from "./pages/ReportFraud";
import FraudIntelligence from "./pages/FraudIntelligence";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import Account from "./pages/Account";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/url-scanner" element={<URLScanner />} />
          <Route path="/scan-history" element={<ScanHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help-support" element={<HelpSupport />} />
          <Route path="/url-result" element={<URLResult />} />
          <Route path="/message-scanner" element={<MessageScanner />} />
          <Route path="/message-result" element={<MessageResult />} />
          <Route path="/report-fraud" element={<ReportFraud />} />
          <Route path="/fraud-intelligence" element={<FraudIntelligence />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
