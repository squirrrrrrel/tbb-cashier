import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import {
  getLowStockDB,
  upsertLowStockDB,
  clearLowStockByOutletDB,
} from "../db/lowStockDB";

export const useLowStockStore = create((set) => ({
  lowStock: [],
  hydrated: false,

  hydrate: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      set({ hydrated: true });
      return;
    }

    const data = await getLowStockDB();
    set({
      lowStock: data.filter(d => d.outletId === outletId),
      hydrated: true,
    });
  },

  fetchLowStockFromAPI: async () => {
    if (!navigator.onLine) return;

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) return;

    const res = await api.get(`/tenant/purchase/low-stock-products/${outletId}`);
    const apiData = res.data.data || [];

    // 🔁 Replace outlet data atomically
    await clearLowStockByOutletDB(outletId);

    for (const item of apiData) {
      await upsertLowStockDB({
        localId: crypto.randomUUID(),
        serverId: item.id,
        productId: item.product_id,
        productName: item.product_name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        outletId,
        outletName: item.outlet_name,
        stock: item.stock,
        threshold: item.threshold,
        img: item.image,
        isSynced: true,
        updatedAt: Date.now(),
      });
    }

    const updated = await getLowStockDB();
    set({
      lowStock: updated.filter(d => d.outletId === outletId),
    });
  },
}));
