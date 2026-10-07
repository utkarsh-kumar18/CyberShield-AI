"""Optional lookups against Google Safe Browsing and VirusTotal."""

import base64
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


TIMEOUT_SECONDS = 2


def _request(url: str, *, method: str = "GET", headers: dict[str, str] | None = None, body: dict | None = None) -> dict:
    payload = json.dumps(body).encode("utf-8") if body is not None else None
    request_headers = {"Accept": "application/json", **(headers or {})}
    if payload is not None:
        request_headers["Content-Type"] = "application/json"
    request = Request(url, data=payload, headers=request_headers, method=method)
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def check_google_safe_browsing(url: str) -> dict:
    api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")
    if not api_key:
        return {"provider": "google_safe_browsing", "status": "not_configured"}
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
    body = {
        "client": {"clientId": "cybershield-ai", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    return _lookup("google_safe_browsing", lambda: _request(endpoint, method="POST", body=body))


def check_virustotal(url: str) -> dict:
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        return {"provider": "virustotal", "status": "not_configured"}
    url_id = base64.urlsafe_b64encode(url.encode("utf-8")).decode("ascii").rstrip("=")
    endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    return _lookup(
        "virustotal",
        lambda: _request(endpoint, headers={"x-apikey": api_key}),
    )


def _lookup(provider: str, callback) -> dict:
    try:
        data = callback()
        if provider == "google_safe_browsing":
            matches = data.get("matches", [])
            return {
                "provider": provider,
                "status": "malicious" if matches else "clean",
                "matches": [{"threat_type": m.get("threatType"), "platform": m.get("platformType")} for m in matches],
            }
        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        malicious = int(stats.get("malicious", 0))
        suspicious = int(stats.get("suspicious", 0))
        return {
            "provider": provider,
            "status": "malicious" if malicious else "suspicious" if suspicious else "clean",
            "malicious_votes": malicious,
            "suspicious_votes": suspicious,
        }
    except HTTPError as error:
        return {"provider": provider, "status": "lookup_error", "detail": f"HTTP {error.code}"}
    except (URLError, TimeoutError, OSError, ValueError, KeyError) as error:
        return {"provider": provider, "status": "lookup_error", "detail": type(error).__name__}


def check_url_threat_intel(url: str) -> list[dict]:
    return [check_google_safe_browsing(url), check_virustotal(url)]
