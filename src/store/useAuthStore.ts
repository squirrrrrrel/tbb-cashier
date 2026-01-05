import { create } from "zustand";
import { getAuth, saveAuth, clearAuth } from "../db/authDB";
import api from "../utils/api"; // ✅ import axios instance

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (payload: { user: any; token: string }) => Promise<void>;
  loginWithCredentials: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  verifyOnline: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,

  // LOGIN (internal - saves auth data)
  login: async (payload) => {
    await saveAuth(payload);
    set({
      ...payload,
      isAuthenticated: true,
      hydrated: true, // ✅ important
    });
  },

  // LOGIN WITH CREDENTIALS (API call)
  loginWithCredentials: async (credentials) => {
    try {
      const res = await api.post("/user/login", {
        ...credentials,
        side: "cashier", // POS cashier side
      });

      // Handle different response formats
      const responseData = res.data?.data || res.data;
      const token = responseData.token || responseData.accessToken;
      const user = responseData.user;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // Save to IndexedDB and update state
      await saveAuth({ user, token });
      set({
        user,
        token,
        isAuthenticated: true,
        hydrated: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  },

  // LOGOUT
  logout: async () => {
    await clearAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: true, // ✅ important
    });
  },

  // HYDRATE ON APP LOAD
  hydrate: async () => {
    const data = await getAuth();
    if (data) {
      set({
        ...data,
        isAuthenticated: true,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  // VERIFY WHEN ONLINE
  verifyOnline: async () => {
    const { token, logout, login } = get();

    if (!token || !navigator.onLine) return;

    try {
      const res = await api.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await login({
        user: res.data.user,
        token: res.data.token,
      });
    } catch (err) {
      await logout();
    }
  },
}));
