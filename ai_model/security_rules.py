"""Explainable scam indicators used alongside the trained text classifier."""

import re
from email.utils import parseaddr


RISK_PATTERNS = {
    "account blocked": 25,
    "verify your account": 25,
    "verify account": 20,
    "kyc": 15,
    "otp": 20,
    "one-time password": 20,
    "password": 15,
    "credit card": 15,
    "debit card": 15,
    "click here": 15,
    "urgent": 10,
    "immediately": 10,
    "prize": 10,
    "winner": 10,
    "won": 10,
}

# A category is raised only when the message includes a specific high-risk
# promise, demand, or action. Mentioning a topic such as "loan" alone is not enough.
CATEGORY_INDICATORS = {
    "LOAN_SCAM": (
        (r"guaranteed (?:approval|loan|funding)", 25),
        (r"no (?:credit check|documents|paperwork).{0,30}(?:loan|approval)?", 20),
        (r"(?:loan|credit).{0,35}(?:upfront|processing|release|insurance) fee", 25),
        (r"pay (?:an? )?(?:upfront|processing|release) fee.{0,35}(?:loan|funds|approval)", 25),
        (r"(?:instant|pre-approved) loan.{0,40}(?:fee|pay|click|apply now)", 20),
        (r"(?:लोन|कर्ज|क़र्ज).{0,40}(?:मंजूर|स्वीकृत|गारंटी|प्रोसेसिंग फीस|पहले फीस|शुल्क)", 25),
        (r"(?:गारंटीड|गारंटी).{0,25}(?:लोन|कर्ज|क़र्ज|मंजूरी)", 20),
    ),
    "PHISHING_EMAIL": (
        (r"verify your (?:gmail|google|email|mail) account", 25),
        (r"(?:account|mailbox).{0,30}(?:suspended|disabled|will be closed)", 20),
        (r"(?:password|login).{0,25}(?:expire|verify|confirm|reset)", 15),
        (r"(?:enter|share|send|confirm).{0,25}(?:otp|one-time password|password)", 20),
        (r"your account.{0,30}(?:locked|suspended|unusual activity)", 20),
        (r"(?:खाता|अकाउंट).{0,30}(?:बंद|ब्लॉक|निलंबित|सस्पेंड)", 20),
        (r"(?:ओटीपी|पासवर्ड).{0,20}(?:भेजें|बताएं|शेयर|सत्यापित)", 20),
        (r"(?:जीमेल|गूगल).{0,30}(?:अकाउंट|खाता).{0,20}(?:सत्यापित|बंद|ब्लॉक)", 25),
    ),
    "JOB_SCAM": (
        (r"(?:job|work).{0,35}(?:registration|training|equipment) fee", 25),
        (r"pay.{0,25}(?:to get|for) (?:the )?(?:job|position|interview)", 25),
        (r"(?:work from home|remote job).{0,50}(?:guaranteed income|no experience).{0,30}(?:fee|pay|deposit)", 20),
        (r"(?:नौकरी|जॉब).{0,35}(?:रजिस्ट्रेशन फीस|ट्रेनिंग फीस|पहले भुगतान)", 25),
    ),
    "INVESTMENT_SCAM": (
        (r"guaranteed.{0,20}(?:profit|returns|收益)", 25),
        (r"(?:double|triple) your (?:money|investment)", 25),
        (r"risk-free.{0,20}(?:investment|profit|returns)", 20),
        (r"(?:crypto|bitcoin|investment).{0,35}(?:guaranteed returns|send funds|deposit now)", 20),
    ),
    "PRIZE_LOTTERY_SCAM": (
        (r"(?:you have|you.ve) won.{0,50}(?:prize|lottery|giveaway)", 20),
        (r"claim your (?:prize|reward|winnings).{0,40}(?:fee|tax|click|account)", 20),
        (r"pay.{0,20}(?:tax|fee).{0,25}(?:prize|winnings|lottery)", 25),
        (r"(?:आपने|आप).{0,25}(?:जीता|जीते).{0,35}(?:इनाम|लॉटरी|पुरस्कार).{0,30}(?:फीस|टैक्स|भुगतान)", 25),
    ),
    "IMPERSONATION_SCAM": (
        (r"(?:police|court|tax department|government|customs).{0,50}(?:arrest|warrant|fine|pay now|account blocked)", 25),
        (r"(?:gift card|crypto|wire transfer).{0,35}(?:payment|pay|send|urgent)", 20),
        (r"(?:tech support|computer support).{0,45}(?:call now|remote access|payment)", 20),
        (r"(?:पुलिस|कोर्ट|आयकर विभाग|सरकार).{0,45}(?:गिरफ्तारी|वारंट|जुर्माना|भुगतान करें)", 25),
    ),
}

URL_PATTERN = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+", re.IGNORECASE)


def _email_domain(value: str) -> str:
    address = parseaddr(value)[1].lower()
    return address.rsplit("@", 1)[-1] if "@" in address else ""


def security_check(message: str) -> tuple[int, str, list[str]]:
    """Return a capped risk score, level, and human-readable evidence labels."""
    text = message.casefold()
    score = 0
    detected_patterns: list[str] = []

    for pattern, points in RISK_PATTERNS.items():
        if pattern in text:
            score += points
            detected_patterns.append(pattern)

    for category, indicators in CATEGORY_INDICATORS.items():
        matched = [points for pattern, points in indicators if re.search(pattern, text)]
        if matched:
            score += max(matched)
            detected_patterns.append(category.lower().replace("_", " "))

    from_match = re.search(r"(?im)^\s*from\s*:\s*(.+)$", message)
    reply_match = re.search(r"(?im)^\s*reply-to\s*:\s*(.+)$", message)
    if from_match and reply_match:
        from_domain = _email_domain(from_match.group(1))
        reply_domain = _email_domain(reply_match.group(1))
        if from_domain and reply_domain and from_domain != reply_domain:
            score += 30
            detected_patterns.append("From and Reply-To domains differ")

    score = min(score, 100)
    risk = "HIGH" if score >= 60 else "MEDIUM" if score >= 30 else "LOW"
    return score, risk, detected_patterns


def detect_categories(message: str, patterns: list[str]) -> list[str]:
    """Return scam category names supported by concrete text indicators."""
    text = message.casefold()
    categories = [
        category
        for category, indicators in CATEGORY_INDICATORS.items()
        if any(re.search(pattern, text) for pattern, _ in indicators)
    ]
    if "From and Reply-To domains differ" in patterns and "PHISHING_EMAIL" not in categories:
        categories.append("PHISHING_EMAIL")
    if URL_PATTERN.search(message) and any(
        phrase in text for phrase in ("verify", "password", "otp", "loan", "fee", "claim", "prize")
    ) and "PHISHING_EMAIL" not in categories:
        categories.append("PHISHING_EMAIL")
    return categories
