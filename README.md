# CyberShield AI

CyberShield provides message and URL analysis through a Flask API and React interface. Guest users can run scans without an account. Signed-in users can save scan history and submit private incident records to this CyberShield installation.

## Detection and privacy limits

- The included text model was trained on English SMS spam. Other languages are not covered by that model; rule coverage for Hindi/Hinglish is partial. Message analysis is disabled if the runtime scikit-learn version does not match the model artifact.
- A low-risk result is not proof that a message or website is safe. Do not use this tool as the sole basis for financial or security decisions.
- Google Safe Browsing and VirusTotal are optional. When configured, submitted URLs are sent to those providers. Unconfigured providers are reported as unavailable/not configured.
- Incident records are private to the signed-in account in the app. This is not an official government or police complaint channel. Do not submit passwords, PINs, OTPs, or payment credentials.

## Local development

Use Python 3.11 or newer and Node.js 24. Before creating the virtual environment, verify `python --version` reports 3.11 or newer. The scikit-learn pin matches the bundled model artifact; Python 3.10 environments use an older incompatible version and cannot run message analysis.

```powershell
cd CyberShield-AI
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m backend.app
```

In a second terminal:

```powershell
cd CyberShield-AI\frontend
npm ci
npm run dev
```

The Vite development server proxies `/api` to `http://127.0.0.1:5000` and opens its local URL directly in Chrome when the server starts. For a production build served by Flask, run `npm run build` first, then start the API.

## Docker Compose

Copy `.env.example` to `.env`, replace every `CHANGE_ME` value with a unique random value, then run:

```powershell
docker compose up --build
```

The Compose stack builds the frontend into the API image, runs database migrations once, and starts the API, PostgreSQL, and Redis. The API binds to loopback by default so it can sit behind a TLS reverse proxy. The Compose file is a single-host reference, not a national-scale production deployment.

Create independent URL-safe secrets (run twice):

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

The API is available at `http://127.0.0.1:5000`; the health endpoints are `/api/health` and `/api/health/ready`. The local server binds to loopback unless `HOST` is explicitly set.

## API

- `GET /api/health` and `GET /api/health/ready` — liveness and dependency readiness.
- `POST /api/analyze` — anonymous message/URL analysis using `{"message":"...", "url":"optional URL"}`.
- `POST /api/url-scan` — anonymous URL-only checks using `{"url":"https://example.com"}`.
- `POST /api/users/register` and `POST /api/users/login` — issue a signed bearer token.
- `POST /api/reports` and `GET /api/reports` — save and list the signed-in user's scans.
- `GET /api/summary` — signed-in user's scan and incident totals.
- `POST /api/incident-reports` and `GET /api/incident-reports` — create and list that user's incident records.
- `GET /api/admin/analytics` and `GET /api/admin/reports` — admin routes using `X-Admin-Key`.

## Verification

```powershell
python -m unittest backend.test_app -v
cd frontend
npm run lint
npm run build
```

## Scaling and production requirements

The code now uses PostgreSQL, shared Redis rate-limit storage, same-origin frontend/API serving, readiness checks, migrations, and container health checks. Serving the whole country still requires an operator-owned cloud or data-centre deployment: a TLS load balancer, multiple API replicas, managed/high-availability PostgreSQL and Redis, backup/restore drills, monitoring and alerting, incident response, abuse controls, secret rotation, privacy/retention policy, accessibility and language evaluation, and independent security/performance review. No hosting, domain, provider credentials, or operating capacity is configured in this repository, so it cannot be deployed or described as nationally production-ready from this workspace alone.
