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

export const usePromotionStore = create((set, get) => ({
  promotions: [],
  hydrated: false,

  /* ================= HYDRATE ================= */

  hydrate: async () => {
    try {
      const promotions = await getPromotionsDB();
      set({
        promotions: promotions.filter(p => !p.isDeleted),
        hydrated: true,
      });

      if (navigator.onLine) {
        await get().fetchPromotionsFromAPI();
      }
    } catch {
      set({ hydrated: true });
    }
  },

  /* ================= ADD ================= */

  addPromotion: async (payload) => {
    const promotion = {
      ...payload,
      localId: crypto.randomUUID(),
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

    promotion.isDeleted = true;
    promotion.isSynced = false;
    promotion.deletedAt = Date.now();

    await updatePromotionDB(promotion);
    set(s => ({
      promotions: s.promotions.filter(p => p.localId !== localId),
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
      const byServerId = new Map(
        existing.filter(p => p.serverId).map(p => [String(p.serverId), p])
      );

      const merged = [];

      for (const p of apiPromotions) {
        const serverId = String(p.promotion_id || p.id);
        const local = byServerId.get(serverId);

        const mapped = mapApiResponseToPromotion(p, local?.localId);
        await updatePromotionDB(mapped);
        merged.push(mapped);
      }

      const localOnly = existing.filter(
        p => !p.serverId && !p.isDeleted
      );

      set({
        promotions: [...merged, ...localOnly],
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
