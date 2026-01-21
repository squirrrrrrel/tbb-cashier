import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import { getProductsDB, upsertProductDB } from "../db/productsDB";
import { aggregateInventoryToProducts } from "../utils/productAggregator";

export const useProductStore = create((set, get) => ({
  products: [],
  hydrated: false,

  hydrate: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      set({ hydrated: true });
      return;
    }

    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId),
      hydrated: true,
    });

    if (navigator.onLine) {
      await get().fetchProductsFromAPI();
    }
  },

  fetchProductsFromAPI: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId || !navigator.onLine) return;

    const res = await api.get(`/tenant/purchase/productList/${outletId}`);
    const apiData = res.data.data;

    const products = aggregateInventoryToProducts(apiData, outletId);

    for (const product of products) {
      await upsertProductDB(product); // idempotent
    }

    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId),
    });
  },
}));
