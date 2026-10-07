"""Flask API gateway and multi-signal analysis tests."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.app import create_app
from backend.services.risk_engine import calculate_risk
from backend.services.url_analysis import analyze_url, extract_urls


class FakeModel:
    classes_ = [0, 1]

    def predict(self, messages):
        text = messages[0].lower()
        return [1 if any(word in text for word in ("scam", "urgent", "winner", "prize")) else 0]

    def predict_proba(self, messages):
        prediction = self.predict(messages)[0]
        return [[0.08, 0.92]] if prediction else [[0.96, 0.04]]


class BackendTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.app = create_app({
            "TESTING": True,
            "DATABASE": str(Path(self.temp_dir.name) / "test.sqlite3"),
            "SECRET_KEY": "unit-test-secret",
            "ADMIN_API_KEY": "test-admin-key",
            "SCAM_MODEL": FakeModel(),
        })
        self.client = self.app.test_client()

    def tearDown(self):
        self.app.extensions["cybershield_db_engine"].dispose()
        self.temp_dir.cleanup()

    def test_gateway_health_and_request_id(self):
        response = self.client.get("/api/health", headers={"X-Request-ID": "test-request-1"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["X-Request-ID"], "test-request-1")
        self.assertEqual(response.json["status"], "ok")

    def test_analysis_uses_nlp_rules_url_and_categories(self):
        response = self.client.post("/api/analyze", json={
            "message": "URGENT guaranteed loan approval. Pay an upfront processing fee to release funds immediately.",
            "url": "http://bit.ly/claim",
        })
        self.assertEqual(response.status_code, 200)
        result = response.json
        self.assertEqual(result["risk_level"], "HIGH")
        self.assertIn("LOAN_SCAM", result["detected_categories"])
        self.assertEqual(result["signals"]["url_analysis"]["status"], "checked")
        self.assertEqual(result["signals"]["threat_intelligence"]["status"], "not_configured")
        self.assertEqual(result["signals"]["language_detection"]["code"], "en")

    def test_gmail_style_reply_to_mismatch(self):
        response = self.client.post("/api/check-scam", json={
            "message": "From: Google <security@google.com>\nReply-To: <help@attacker.example>\nVerify your account urgently."
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("PHISHING_EMAIL", response.json["detected_categories"])
        self.assertIn("From and Reply-To domains differ", response.json["detected_patterns"])

    def test_hindi_text_uses_rules_and_does_not_claim_english_ml_coverage(self):
        response = self.client.post("/api/analyze", json={
            "message": "गारंटीड लोन मंजूरी, पहले प्रोसेसिंग फीस भेजें।"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["signals"]["language_detection"]["code"], "hi-deva")
        self.assertEqual(response.json["ml_prediction"], "OUT_OF_SCOPE")
        self.assertIn("LOAN_SCAM", response.json["detected_categories"])

    def test_threat_intel_signal_is_combined_and_reported(self):
        with patch("backend.services.analysis.check_url_threat_intel", return_value=[
            {"provider": "test", "status": "malicious"}
        ]):
            response = self.client.post("/api/analyze", json={"url": "https://bad.example"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["signals"]["threat_intelligence"]["status"], "checked")
        self.assertIn("MALICIOUS_URL", response.json["detected_categories"])
        self.assertIn("URL flagged by threat intelligence", response.json["detected_patterns"])

    def test_missing_input_and_invalid_json_are_rejected(self):
        self.assertEqual(self.client.post("/api/analyze", json={}).status_code, 400)
        self.assertEqual(self.client.post("/api/analyze", data="no-json").status_code, 400)

    def test_url_scan_flags_shorteners_and_raw_ip_addresses(self):
        response = self.client.post("/api/url-scan", json={"url": "http://192.0.2.10/path"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("URL uses a raw IP address", response.json["findings"])
        self.assertGreaterEqual(response.json["score"], 40)
        self.assertEqual(extract_urls("see https://example.test/a, then www.bad.example"), [
            "https://example.test/a", "http://www.bad.example"
        ])
        self.assertIn("URL uses a link shortener", analyze_url("https://bit.ly/abc")["findings"])

    def test_user_registration_login_report_and_admin_analytics(self):
        registration = self.client.post("/api/users/register", json={
            "email": "user@example.test", "password": "correct-horse-battery"
        })
        self.assertEqual(registration.status_code, 201)
        token = registration.json["token"]
        login = self.client.post("/api/users/login", json={
            "email": "USER@example.test", "password": "correct-horse-battery"
        })
        self.assertEqual(login.status_code, 200)

        report = self.client.post("/api/reports", json={"message": "Prize winner, claim now!"}, headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(report.status_code, 201)
        history = self.client.get("/api/reports", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(len(history.json["reports"]), 1)

        self.assertEqual(self.client.get("/api/admin/analytics").status_code, 403)
        analytics = self.client.get("/api/admin/analytics", headers={"X-Admin-Key": "test-admin-key"})
        self.assertEqual(analytics.status_code, 200)
        self.assertEqual(analytics.json["users"], 1)
        self.assertEqual(analytics.json["reports"], 1)
        admin_reports = self.client.get("/api/admin/reports", headers={"X-Admin-Key": "test-admin-key"})
        self.assertEqual(admin_reports.json["reports"][0]["email"], "user@example.test")

    def test_risk_engine_escalates_confirmed_threat_intel(self):
        result = calculate_risk(
            spam_probability=0.05,
            rule_score=0,
            url_score=0,
            threat_intel=[{"status": "malicious"}],
            has_urls=True,
        )
        self.assertEqual(result["level"], "CRITICAL")
        self.assertEqual(result["result"], "SCAM / PHISHING")


if __name__ == "__main__":
    unittest.main()
