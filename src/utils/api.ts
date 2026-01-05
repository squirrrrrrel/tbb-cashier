import axios from "axios";
import { getAuth } from "../db/authDB";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_BACKEND_API || "",
});

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

