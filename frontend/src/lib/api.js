const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal || controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw new ApiError("Request timed out. Please try again.");
    throw new ApiError("Could not reach CyberShield. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || `Request failed (${response.status}).`, response.status);
  }
  return payload;
}

export function scanMessage(message, token) {
  const payload = { message };
  return token
    ? apiRequest("/reports", { body: payload, token })
    : apiRequest("/analyze", { body: payload });
}

export function scanUrl(url, token) {
  const payload = { url };
  return token
    ? apiRequest("/reports", { body: payload, token })
    : apiRequest("/url-scan", { body: payload });
}

export function listReports(token) {
  return apiRequest("/reports", { token });
}

export function listIncidents(token) {
  return apiRequest("/incident-reports", { token });
}

export function submitIncident(report, token) {
  return apiRequest("/incident-reports", { body: report, token });
}
