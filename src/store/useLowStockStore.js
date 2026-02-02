import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import {
  getLowStockDB,
  upsertLowStockDB,
  clearLowStockByOutletDB,
} from "../db/lowStockDB";
import { v4 as uuidv4 } from "uuid";

export const useLowStockStore = create((set) => ({
  lowStock: [],
  hydrated: false,

  hydrate: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      set({ hydrated: true });
      return;
    }

    // 1️⃣ Load from IndexedDB
    const data = await getLowStockDB();
    set({
      lowStock: data.filter(d => d.outletId === outletId),
      hydrated: true,
    });

    // 2️⃣ If online → fetch from API
    if (navigator.onLine) {
      try {
        await useLowStockStore.getState().fetchLowStockFromAPI();
      } catch (e) {
        console.warn("Low stock API fetch failed", e);
      }
    }
  },

  fetchLowStockFromAPI: async () => {
    if (!navigator.onLine) return;

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) return;

    const res = await api.get(
      `/tenant/purchase/low-stock-products/${outletId}`
    );

    // ✅ SAFELY NORMALIZE API RESPONSE
    let apiData = [];

    if (Array.isArray(res.data?.data)) {
      apiData = res.data.data;
    } else if (Array.isArray(res.data?.data?.data)) {
      apiData = res.data.data.data;
    } else if (Array.isArray(res.data)) {
      apiData = res.data;
    } else {
      console.warn("⚠️ Low stock API returned invalid data:", res.data);
      return;
    }

    // 🔁 Replace outlet data atomically
    await clearLowStockByOutletDB(outletId);

    for (const item of apiData) {
      await upsertLowStockDB({
        localId: uuidv4(),
        serverId: item.id,
        productId: item.productId,
        productName: item.productName,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        outletId,
        outletName: item.outletName,
        stock: item.stockQuantity,
        threshold: item.threshold,
        img: item.imageUrl,
        isSynced: true,
        updatedAt: Date.now(),
      });
    }

    const updated = await getLowStockDB();
    set({
      lowStock: updated.filter(d => d.outletId === outletId),
    });

    console.log(`✅ Low stock synced: ${apiData.length} items`);
  },

}));
