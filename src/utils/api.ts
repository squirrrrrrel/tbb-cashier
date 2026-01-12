import axios from "axios";
import { getAuth } from "../db/authDB";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_BACKEND_API || "",
});

// Synchronously seed Authorization header from localStorage so a hard-refresh
// while offline still uses the saved token immediately.
try {
  const raw = localStorage.getItem("pos-auth-session");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed?.token) api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
  }
} catch (err) {
  // ignore (e.g. SSR or private mode)
}

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  // Get token from IndexedDB
  const authData = await getAuth();
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default api;

