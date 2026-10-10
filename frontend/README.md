# CyberShield frontend

React/Vite user interface for the CyberShield API. During local development, `/api` requests are proxied to the Flask service at `http://127.0.0.1:5000`.

## Local development

```sh
npm ci
npm run dev
```

The dev server opens its local URL in Chrome automatically. Set `CHROME_PATH` if Chrome is installed outside the standard Windows locations.

Build static assets with `npm run build`. The root Docker image includes those files and serves them from Flask on the same origin as `/api`.
