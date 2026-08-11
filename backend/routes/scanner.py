import os
import time
import requests

from flask import Blueprint, request, jsonify
from urllib.parse import urlparse
from dotenv import load_dotenv
from extensions import db
from models.scan import Scan
from flask_jwt_extended import jwt_required, get_jwt_identity


load_dotenv()

scanner = Blueprint("scanner", __name__)

VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3"


@scanner.route("/url", methods=["POST"])
@jwt_required()
def scan_url():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data received"
        }), 400

    url = data.get("url", "").strip()

    if not url:
        return jsonify({
            "status": "error",
            "message": "URL is required"
        }), 400

    # Basic URL validation
    parsed_url = urlparse(url)

    if parsed_url.scheme not in ["http", "https"]:
        return jsonify({
            "status": "suspicious",
            "url": url,
            "message": "Invalid URL format."
        }), 400

    if not parsed_url.netloc:
        return jsonify({
            "status": "suspicious",
            "url": url,
            "message": "Invalid website address."
        }), 400

    api_key = os.getenv("VIRUSTOTAL_API_KEY")

    if not api_key or api_key == "YOUR_VIRUSTOTAL_API_KEY":
        return jsonify({
            "status": "error",
            "url": url,
            "message": "VirusTotal API key is not configured."
        }), 500

    # Google Safe Browsing check
    google_api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")

    google_threats = []
    google_status = "not_checked"

    if google_api_key and google_api_key != "YOUR_GOOGLE_SAFE_BROWSING_API_KEY":

        try:

            google_response = requests.post(
                "https://safebrowsing.googleapis.com/v4/threatMatches:find",
                params={
                    "key": google_api_key
                },
                json={
                    "client": {
                        "clientId": "cybershield-ai",
                        "clientVersion": "1.0"
                    },
                    "threatInfo": {
                        "threatTypes": [
                            "MALWARE",
                            "SOCIAL_ENGINEERING",
                            "UNWANTED_SOFTWARE",
                            "POTENTIALLY_HARMFUL_APPLICATION"
                        ],
                        "platformTypes": [
                            "ANY_PLATFORM"
                        ],
                        "threatEntryTypes": [
                            "URL"
                        ],
                        "threatEntries": [
                            {
                                "url": url
                            }
                        ]
                    }
                },
                timeout=10
            )

            if google_response.status_code == 200:

                google_data = google_response.json()

                google_threats = google_data.get(
                    "matches",
                    []
                )

                if google_threats:
                    google_status = "unsafe"
                else:
                    google_status = "safe"

            else:

                print(
                    "Google Safe Browsing HTTP error:",
                    google_response.status_code,
                    google_response.text[:300]
                )

                google_status = "error"

        except requests.RequestException as error:

            print(
                "Google Safe Browsing error:",
                error
            )

            google_status = "error"

    try:

        headers = {
            "x-apikey": api_key
        }

        # Submit URL to VirusTotal
        response = requests.post(
            f"{VIRUSTOTAL_URL}/urls",
            headers=headers,
            data={"url": url},
            timeout=20
        )

        if response.status_code != 200:

            return jsonify({
                "status": "error",
                "url": url,
                "message": "VirusTotal rejected the scan request.",
                "details": response.text[:300]
            }), response.status_code

        scan_data = response.json()

        analysis_id = (
            scan_data
            .get("data", {})
            .get("id")
        )

        if not analysis_id:

            return jsonify({
                "status": "error",
                "url": url,
                "message": "VirusTotal did not return an analysis ID."
            }), 502

        # Wait briefly for analysis
        time.sleep(3)

        analysis_response = requests.get(
            f"{VIRUSTOTAL_URL}/analyses/{analysis_id}",
            headers=headers,
            timeout=20
        )

        if analysis_response.status_code != 200:

            return jsonify({
                "status": "pending",
                "url": url,
                "message": "VirusTotal scan is still processing."
            }), 202

        analysis_data = analysis_response.json()

        attributes = (
            analysis_data
            .get("data", {})
            .get("attributes", {})
        )

        status = attributes.get("status")

        stats = attributes.get(
            "stats",
            {}
        )

        malicious = stats.get(
            "malicious",
            0
        )

        suspicious = stats.get(
            "suspicious",
            0
        )

        harmless = stats.get(
            "harmless",
            0
        )

        undetected = stats.get(
            "undetected",
            0
        )

        # Combine VirusTotal + Google Safe Browsing results

        google_is_unsafe = (
            google_status == "unsafe"
        )

        if malicious > 0 or google_is_unsafe:

            threat_status = "malicious"

            message_parts = []

            if malicious > 0:
                message_parts.append(
                    f"VirusTotal detected {malicious} malicious engine verdict(s)."
                )

            if google_is_unsafe:
                message_parts.append(
                    "Google Safe Browsing identified this URL as unsafe."
                )

            message = " ".join(message_parts)


        elif suspicious > 0:

            threat_status = "suspicious"

            message = (
                f"VirusTotal reported {suspicious} "
                "suspicious verdict(s)."
            )


        elif status == "completed":

            threat_status = "safe"

            if google_status == "safe":

                message = (
                    "No malicious or suspicious verdicts were "
                    "returned by VirusTotal, and Google Safe Browsing "
                    "found no known threats."
                )

            elif google_status == "error":

                message = (
                    "VirusTotal found no malicious or suspicious "
                    "verdicts, but Google Safe Browsing could not "
                    "be reached."
                )

            else:

                message = (
                    "No malicious or suspicious verdicts were "
                    "returned by the completed VirusTotal analysis."
                )


        else:

            threat_status = "pending"

            message = (
                "VirusTotal analysis is still processing."
            )

        user_id = get_jwt_identity()

        scan = Scan(
            user_id=user_id,
            scan_type="url",
            target=url,
            result=threat_status
        )

        db.session.add(scan)
        db.session.commit()    

        return jsonify({

            "status": threat_status,

            "url": url,

            "message": message,

            "virustotal": {
                "analysis_status": status,
                "malicious": malicious,
                "suspicious": suspicious,
                "harmless": harmless,
                "undetected": undetected
            },

            "google_safe_browsing": {
                "status": google_status,
                "threats": google_threats
            }

        }), 200

    except requests.RequestException as error:

        print("VirusTotal error:", error)

        return jsonify({
            "status": "error",
            "url": url,
            "message": "Unable to contact VirusTotal."
        }), 502

    except Exception as error:

        print("Scanner error:", error)

        return jsonify({
            "status": "error",
            "url": url,
            "message": "An unexpected scanner error occurred."
        }), 500

@scanner.route("/my-scans", methods=["GET"])
@jwt_required()
def my_scans():

    user_id = get_jwt_identity()

    scans = Scan.query.filter_by(
        user_id=user_id
    ).order_by(
        Scan.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "count": len(scans),
        "scans": [
            {
                "id": scan.id,
                "scan_type": scan.scan_type,
                "target": scan.target,
                "result": scan.result,
                "created_at": scan.created_at.isoformat()
            }
            for scan in scans
        ]
    }), 200