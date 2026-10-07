# CyberShield AI

Backend-only Flask API for scam message and URL analysis. The pipeline combines language hints, the included SMS text model, explainable scam rules, offline URL checks, optional threat intelligence, and a risk score.

## Detection scope

The included ML model was trained on English SMS spam data; it is one signal and is not trained on every scam type. Rules cover common loan, phishing/email, job, investment, prize, and impersonation patterns, with partial Hindi/Hinglish support. Other Indian languages need suitable training data and evaluation before they can be considered supported. Gmail is not accessed directly: submit email text and, where available, its `From` and `Reply-To` headers.

Google Safe Browsing and VirusTotal checks are optional. They run only when their API keys are configured, and submitted URLs are sent to those providers. The API still works without them and marks threat intelligence as skipped.

## Run locally

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m backend.app
```

The API listens on `http://127.0.0.1:5000` by default. Configure unique `CYBERSHIELD_SECRET_KEY` and `CYBERSHIELD_ADMIN_API_KEY` values outside local development. Optional integrations use `GOOGLE_SAFE_BROWSING_API_KEY` and `VIRUSTOTAL_API_KEY`. Set `CYBERSHIELD_DATABASE` to change the SQLite file location.

## Docker Compose

Copy `.env.example` to `.env`, set strong secrets, then run:

```powershell
docker compose up --build
```

Compose is a development/portfolio deployment reference. A national-scale production service still needs deployment-specific capacity planning, monitoring, incident response, data governance, and security review.

## Main API routes

- `GET /api/health` and `GET /api/health/ready` — liveness and readiness.
- `POST /api/analyze` or `POST /api/check-scam` — analyze `{"message":"...", "url":"optional URL"}`.
- `POST /api/url-scan` — local URL-only check with `{"url":"https://..."}`.
- `POST /api/users/register`, `POST /api/users/login` — create an account and receive a signed bearer token.
- `POST /api/reports`, `GET /api/reports` — save and view the signed-in user's scans.
- `GET /api/admin/analytics`, `GET /api/admin/reports` — admin routes using the `X-Admin-Key` header.

## Tests

```powershell
python -m unittest backend.test_app -v
```
