
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import URLScanner from "./pages/URLScanner";
import URLResult from "./pages/URLResult";
import MessageScanner from "./pages/MessageScanner";
import MessageResult from "./pages/MessageResult";
import ReportFraud from "./pages/ReportFraud";
import FraudIntelligence from "./pages/FraudIntelligence";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/url-scanner" element={<URLScanner />} />
        <Route path="/url-result" element={<URLResult />} />

        <Route path="/message-scanner" element={<MessageScanner />} />
        <Route path="/message-result" element={<MessageResult />} />
        <Route path="/report-fraud" element={<ReportFraud />} />
        <Route
           path="/fraud-intelligence"
          element={<FraudIntelligence />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;