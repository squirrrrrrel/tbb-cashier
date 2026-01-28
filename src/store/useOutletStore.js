import { create } from "zustand";
import api from "../utils/api";
import {
    getOutletDB,
    bulkUpsertOutletDB,
} from "../db/outletDB";
import { mapApiResponseToOutlet } from "../utils/outletMapper";

export const useOutletStore = create((set, get) => ({
    outlets: [],
    hydrated: false,

    /* ================= HYDRATE ================= */

    hydrate: async () => {
        if (get().hydrated) return;

        try {
            // 1️⃣ Load from IndexedDB first
            const localOutlets = await getOutletDB();

            set({
                outlets: localOutlets,
                hydrated: true,
            });

            // 2️⃣ Sync from API in background
            if (navigator.onLine) {
                get().fetchOutletsFromAPI();
            }
        } catch (err) {
            console.error("Outlet hydrate failed:", err);
            set({ hydrated: true });
        }
    },

    /* ================= FETCH ================= */

    fetchOutletsFromAPI: async () => {
        if (!navigator.onLine) return;

        try {
            const res = await api.get("/tenant/outlet");

            const apiOutlet = res?.data || [];

            const mapped = apiOutlet.map(mapApiResponseToOutlet);

            // 🔥 UPSERT into IndexedDB
            await bulkUpsertOutletDB(mapped);

            // 🔥 Update Zustand
            set({ outlets: mapped });
        } catch (err) {
            console.warn("⚠️ Failed to fetch outlets, using local data");
        }
    },
}));
