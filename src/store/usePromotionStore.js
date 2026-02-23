import { create } from "zustand";
import api from "../utils/api";
import {
  getPromotionsDB,
  addPromotionDB,
  updatePromotionDB,
} from "../db/promotionDB";
import {
  mapPromotionToApiPayload,
  mapApiResponseToPromotion,
} from "../utils/promotionMapper";
import { v4 as uuidv4 } from "uuid";


export const usePromotionStore = create((set, get) => ({
  promotions: [],
  hydrated: false,

  /* ================= HYDRATE ================= */

  hydrate: async () => {
    try {
      const allPromotions = await getPromotionsDB();
      // 1. Strictly filter out anything marked deleted immediately
      const cleanPromotions = allPromotions.filter(p => !p.isDeleted);

      set({
        promotions: cleanPromotions,
        hydrated: true,
      });

      if (navigator.onLine) {
        // Run sync first to remove deleted items from server 
        // before fetching the new list
        await get().syncPromotions();
        await get().fetchPromotionsFromAPI();
      }
    } catch (error) {
      console.error("Hydration failed", error);
      set({ hydrated: true });
    }
  },

  /* ================= ADD ================= */

  addPromotion: async (payload) => {
    const promotion = {
      ...payload,
      localId: uuidv4(),
      serverId: null,
      isSynced: false,
      isDeleted: false,
      createdAt: Date.now(),
    };

    await addPromotionDB(promotion);
    set(s => ({ promotions: [...s.promotions, promotion] }));

    if (navigator.onLine) {
      try {
        const res = await api.post(
          "/tenant/promotions",
          mapPromotionToApiPayload(promotion)
        );

        promotion.serverId =
          res.data.data?.promotion_id || res.data.data?.id;
        promotion.isSynced = true;

        await updatePromotionDB(promotion);
        set(s => ({
          promotions: s.promotions.map(p =>
            p.localId === promotion.localId ? promotion : p
          ),
        }));
      } catch {
        console.warn("⚠️ Promotion sync failed, will retry later");
      }
    }
  },

  /* ================= UPDATE ================= */

  editPromotion: async (payload) => {
    const updated = {
      ...payload,
      isSynced: false,
      updatedAt: Date.now(),
    };

    await updatePromotionDB(updated);
    set(s => ({
      promotions: s.promotions.map(p =>
        p.localId === updated.localId ? updated : p
      ),
    }));

    if (navigator.onLine && updated.serverId) {
      try {
        await api.put(
          `/tenant/promotions/${updated.serverId}`,
          mapPromotionToApiPayload(updated)
        );
        updated.isSynced = true;
        await updatePromotionDB(updated);
      } catch {
        console.warn("⚠️ Promotion update sync failed");
      }
    }
  },

  /* ================= DELETE ================= */

  deletePromotion: async (localId) => {
    const promotion = get().promotions.find(p => p.localId === localId);
    if (!promotion) return;

    const serverId = promotion.serverId;

    promotion.isDeleted = true;
    promotion.isSynced = false;
    promotion.deletedAt = Date.now();

    await updatePromotionDB(promotion);
    set(s => ({
      promotions: s.promotions.filter(p =>
        p.localId !== localId && (!serverId || String(p.serverId) !== String(serverId))
      ),
    }));

    if (navigator.onLine && promotion.serverId) {
      try {
        await api.delete(`/tenant/promotions/${promotion.serverId}`);
        promotion.isSynced = true;
        await updatePromotionDB(promotion);
      } catch {
        console.warn("⚠️ Promotion delete sync failed");
      }
    }
  },

  /* ================= FETCH ================= */

  fetchPromotionsFromAPI: async () => {
    if (!navigator.onLine) return;

    try {
      const res = await api.get("/tenant/promotions");
      const apiPromotions = res.data.data || [];

      const existing = await getPromotionsDB();
      // Create a map of items that are marked as deleted locally
      const deletedLocally = new Set(
        existing.filter(p => p.isDeleted).map(p => String(p.serverId))
      );

      const byServerId = new Map(
        existing.filter(p => p.serverId).map(p => [String(p.serverId), p])
      );

      const merged = [];

      for (const p of apiPromotions) {
        const serverId = String(p.promotion_id || p.id);

        // 2. CRITICAL: If this item is marked as deleted locally, 
        // do NOT add it to the merged list, even if the API returned it.
        if (deletedLocally.has(serverId)) continue;

        const local = byServerId.get(serverId);
        const mapped = mapApiResponseToPromotion(p, local?.localId);

        await updatePromotionDB(mapped);
        merged.push(mapped);
      }

      const localOnly = existing.filter(
        p => !p.serverId && !p.isDeleted
      );

      const all = [...merged, ...localOnly];
      const finalMap = new Map();
      all.forEach(p => {
        const id = p.serverId ? String(p.serverId) : p.localId;
        if (!finalMap.has(id)) finalMap.set(id, p);
      });

      set({
        promotions: Array.from(finalMap.values()),
      });
    } catch (err) {
      console.error("❌ Failed to fetch promotions", err);
    }
  },

  /* ================= SYNC ================= */

  syncPromotions: async () => {
    if (!navigator.onLine) return;

    const promotions = await getPromotionsDB();

    for (const p of promotions) {
      if (p.isDeleted && p.serverId && !p.isSynced) {
        await api.delete(`/tenant/promotions/${p.serverId}`);
        p.isSynced = true;
        await updatePromotionDB(p);
      }

      if (!p.isDeleted && !p.isSynced) {
        if (p.serverId) {
          await api.put(
            `/tenant/promotions/${p.serverId}`,
            mapPromotionToApiPayload(p)
          );
        } else {
          const res = await api.post(
            "/tenant/promotions",
            mapPromotionToApiPayload(p)
          );
          p.serverId = res.data.data?.promotion_id;
        }
        p.isSynced = true;
        await updatePromotionDB(p);
      }
    }

    set({
      promotions: promotions.filter(p => !p.isDeleted),
    });
  },
}));
