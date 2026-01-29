import { create } from "zustand";
import api from "../utils/api";
import {
  getCategoriesDB,
  bulkUpsertCategoriesDB,
} from "../db/categoryDB";
import { mapApiResponseToCategory } from "../utils/categoryMapper";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  hydrated: false,

  /* ================= HYDRATE ================= */

  hydrate: async () => {
    if (get().hydrated) return;

    try {
      // 1️⃣ Load from IndexedDB first
      const localCategories = await getCategoriesDB();

      set({
        categories: localCategories,
        hydrated: true,
      });

      // 2️⃣ Sync from API in background
      if (navigator.onLine) {
        get().fetchCategoriesFromAPI();
      }
    } catch (err) {
      console.error("Category hydrate failed:", err);
      set({ hydrated: true });
    }
  },

  /* ================= FETCH ================= */

  fetchCategoriesFromAPI: async () => {
    if (!navigator.onLine) return;

    try {
      const res = await api.get("/admin/category");

      const apiCategories = res?.data?.data || [];

      const mapped = apiCategories.map(mapApiResponseToCategory);

      // 🔥 UPSERT into IndexedDB
      await bulkUpsertCategoriesDB(mapped);

      // 🔥 Update Zustand
      set({ categories: mapped });
    } catch (err) {
      console.warn("⚠️ Failed to fetch categories, using local data");
    }
  },
}));
