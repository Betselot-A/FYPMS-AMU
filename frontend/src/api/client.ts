// ============================================================
// ProjectHub Axios API Client
// Centralized configuration for communicating with the backend API.
// ============================================================

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // JWT is sent via Authorization header — no cookies needed
});

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // For file uploads (FormData), remove the explicit Content-Type so that
  // the browser can generate the correct multipart/form-data boundary.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Fire a custom event — AuthContext listens and clears state via React Router
      sessionStorage.removeItem("auth_token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    console.error("[API Error]", status, error.config?.url, error.response?.data?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
