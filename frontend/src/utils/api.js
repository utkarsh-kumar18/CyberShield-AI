const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
    
export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    // Invalid or expired JWT
    if (response.status === 401 || response.status === 422) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return null;
    }

    return response;
}