"""Offline checks on URLs supplied in text or directly to the scan endpoint."""

import ipaddress
import re
from urllib.parse import urlsplit


URL_RE = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+", re.IGNORECASE)
SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy",
}


def extract_urls(text: str) -> list[str]:
    urls: list[str] = []
    for match in URL_RE.findall(text):
        value = match.rstrip(".,;:!?)]")
        if value.lower().startswith("www."):
            value = "http://" + value
        if value not in urls:
            urls.append(value)
    return urls[:10]


def analyze_url(url: str) -> dict[str, object]:
    value = url.strip()
    if value.lower().startswith("www."):
        value = "http://" + value
    parsed = urlsplit(value)
    host = (parsed.hostname or "").lower().rstrip(".")
    findings: list[str] = []
    score = 0

    if parsed.scheme not in {"http", "https"} or not host:
        findings.append("invalid or unsupported URL")
        return {"url": url, "host": host, "score": 45, "findings": findings}

    try:
        ipaddress.ip_address(host.strip("[]"))
        score += 40
        findings.append("URL uses a raw IP address")
    except ValueError:
        pass

    if host in SHORTENERS:
        score += 30
        findings.append("URL uses a link shortener")
    if host.startswith("xn--") or ".xn--" in host:
        score += 30
        findings.append("URL contains an internationalized/punycode domain")
    if parsed.username or parsed.password:
        score += 35
        findings.append("URL contains embedded username or password")
    if parsed.scheme == "http":
        score += 10
        findings.append("URL does not use HTTPS")
    if host.count(".") >= 4:
        score += 10
        findings.append("URL has an unusually deep subdomain")

    return {
        "url": url,
        "host": host,
        "score": min(score, 100),
        "findings": findings,
    }


def analyze_urls(urls: list[str]) -> dict[str, object]:
    results = [analyze_url(url) for url in urls[:10]]
    return {
        "urls": results,
        "score": max((int(result["score"]) for result in results), default=0),
        "status": "checked" if results else "no_urls_found",
    }
