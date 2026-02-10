import { create } from "zustand";
import { getAuth, saveAuth, clearAuth } from "../db/authDB";
import api from "../utils/api";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;

  login: (payload: { user: any; token: string }) => Promise<void>;
  loginWithCredentials: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  verifyOnline: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,

  /* -------------------------------------------------------
   * LOCAL LOGIN (NO SERVER)
   * ----------------------------------------------------- */
  login: async (payload) => {
    await saveAuth(payload);
    set({
      user: payload.user,
      token: payload.token,
      isAuthenticated: true,
      hydrated: true,
    });
  },

  /* -------------------------------------------------------
   * ONLINE LOGIN (SERVER REQUIRED)
   * ----------------------------------------------------- */
  loginWithCredentials: async (credentials) => {
    const res = await api.post("/user/login", {
      ...credentials,
      side: "cashier",
    });

    const data = res.data?.data || res.data;
    const token = data?.token || data?.accessToken;
    const user = data?.user;
    if (!token || !user) {
      throw new Error("Invalid login response");
    }

    await saveAuth({ user, token });

    set({
      user,
      token,
      isAuthenticated: true,
      hydrated: true,
    });
    return user;
  },

  /* -------------------------------------------------------
   * LOGOUT (LOCAL ONLY)
   * ----------------------------------------------------- */
  logout: async () => {
    await clearAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: true,
    });
  },

  /* -------------------------------------------------------
   * HYDRATE (OFFLINE-FIRST, NO SERVER EVER)
   * ----------------------------------------------------- */
  hydrate: async () => {
    try {
      const data = await getAuth(); // IndexedDB only

      if (data?.token && data?.user) {
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch (err) {
      // 🔴 NEVER BLOCK UI
      set({ hydrated: true });
    }
  },

  /* -------------------------------------------------------
   * VERIFY (ONLINE ONLY, NEVER AUTO-LOGOUT)
   * ----------------------------------------------------- */
  verifyOnline: async () => {
    const { token } = get();

    // 🔒 Offline-safe guard
    if (!token || !navigator.onLine) return;

    try {
      const res = await api.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data || res.data;

      if (!data?.user || !data?.token) return;

      await saveAuth({
        user: data.user,
        token: data.token,
      });

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      });
    } catch (err) {
      // ❌ DO NOT LOGOUT
      console.warn("Verify failed, continuing offline session");
    }
  },
  setOutlet: async (outlet_id: string) => {
  const { user, token } = get();

  if (!user || !token) return;

  const updatedUser = {
    ...user,
    outlet_id,
  };

  // ✅ Persist to IndexedDB
  await saveAuth({
    user: updatedUser,
    token,
  });

  // ✅ Update Zustand
  set({
    user: updatedUser,
    isAuthenticated: true,
  });
},

}));
