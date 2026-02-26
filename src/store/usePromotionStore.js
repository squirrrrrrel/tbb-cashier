import { create } from "zustand";
import api from "../utils/api";
import { getPromotionsDB, updatePromotionDB, deletePromotionDB } from "../db/promotionDB";
import { mapApiResponseToPromotion } from "../utils/promotionMapper";

export const usePromotionStore = create((set, get) => ({
  promotions: [],
  hydrated: false,
  isLoading: false,

  /* ================= HYDRATE ================= */
  hydrate: async () => {
    try {
      const localPromotions = await getPromotionsDB();
      set({
        promotions: localPromotions,
        hydrated: true,
      });
      if (navigator.onLine) {
        await get().fetchPromotionsFromAPI();
      }
    } catch (error) {
      console.error("Hydration failed", error);
      set({ hydrated: true });
    }
  },

  /* ================= FETCH & SYNC DOWN ================= */
  fetchPromotionsFromAPI: async () => {
    if (!navigator.onLine) return;

    try {
      const res = await api.get("/tenant/promotions");
      const apiPromotions = res.data.data || [];

      // 1. Map API data - ensure 'serverId' is assigned correctly here
      const formattedPromotions = apiPromotions.map((p) =>
        mapApiResponseToPromotion(p)
      );

      // 2. Create a Set of valid Server IDs from the API (as strings)
      const apiServerIds = new Set(formattedPromotions.map(p => String(p.serverId)));

      // 3. Get all current promotions from IndexedDB
      const localPromotions = await getPromotionsDB();

      // 4. CLEANUP LOOP
      for (const localPromo of localPromotions) {
        // Ensure we are checking the exact property defined as keyPath
        const currentId = localPromo.serverId;

        if (!apiServerIds.has(String(currentId))) {
          console.log(`🗑️ Deleting ${currentId} from IndexedDB...`);

          // Since keyPath is "serverId", we MUST pass the serverId value here
          await deletePromotionDB(currentId);
        }
      }

      // 5. Update/Insert fresh data
      for (const promo of formattedPromotions) {
        await updatePromotionDB(promo);
      }

      set({ promotions: formattedPromotions, hydrated: true });

    } catch (err) {
      console.error("❌ Sync failed:", err);
    }
  },
}));