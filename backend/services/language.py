"""Lightweight language hints; this is not a full language identification model."""

import re


HINGLISH_MARKERS = {
    "hai", "hain", "kripya", "aapka", "turant", "bheje", "bhejo", "karo",
    "khata", "inaam", "jeet", "karna", "nahi", "paise", "milega", "bhejo",
}

SCRIPT_HINTS = (
    (re.compile(r"[\u0980-\u09ff]"), "bn-as", "Bengali or Assamese"),
    (re.compile(r"[\u0a00-\u0a7f]"), "pa", "Punjabi"),
    (re.compile(r"[\u0a80-\u0aff]"), "gu", "Gujarati"),
    (re.compile(r"[\u0b00-\u0b7f]"), "or", "Odia"),
    (re.compile(r"[\u0b80-\u0bff]"), "ta", "Tamil"),
    (re.compile(r"[\u0c00-\u0c7f]"), "te", "Telugu"),
    (re.compile(r"[\u0c80-\u0cff]"), "kn", "Kannada"),
    (re.compile(r"[\u0d00-\u0d7f]"), "ml", "Malayalam"),
    (re.compile(r"[\u0d80-\u0dff]"), "si", "Sinhala"),
    (re.compile(r"[\u1c50-\u1c7f]"), "sat", "Santali"),
    (re.compile(r"[\uab80-\uabff]"), "mni", "Manipuri"),
    (re.compile(r"[\u0600-\u06ff]"), "ur-ar", "Urdu or Arabic script"),
)


def detect_language(text: str) -> dict[str, str]:
    if re.search(r"[\u0900-\u097f]", text):
        return {"code": "hi-deva", "name": "Hindi/Marathi or another Devanagari language", "method": "script heuristic"}
    for pattern, code, name in SCRIPT_HINTS:
        if pattern.search(text):
            return {"code": code, "name": name, "method": "script heuristic"}
    words = set(re.findall(r"[a-z]+", text.casefold()))
    if words & HINGLISH_MARKERS:
        return {"code": "hi-en", "name": "Hindi-English (Hinglish)", "method": "keyword heuristic"}
    if re.search(r"[a-z]", text, re.IGNORECASE):
        return {"code": "en", "name": "English or Latin-script text", "method": "script heuristic"}
    return {"code": "unknown", "name": "Unknown", "method": "script heuristic"}
