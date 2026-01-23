import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import { getProductsDB, updateProductStockDB ,upsertProductDB} from "../db/productsDB";
import { aggregateInventoryToProducts } from "../utils/productAggregator";

export const useProductStore = create((set, get) => ({
  products: [],
  hydrated: false,
  ready: false, // 🔒 NEW FLAG

  hydrate: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      set({ hydrated: true, ready: true });
      return;
    }

    // 1️⃣ Load from IndexedDB
    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId),
      hydrated: true,
    });

    // 2️⃣ If online → fetch from API FIRST
    if (navigator.onLine) {
      await get().fetchProductsFromAPI();
    }

    // 🔓 Products are now guaranteed to exist
    set({ ready: true });
  },

  // 🚫 DO NOTHING IF NOT READY
  subtractStockLocal: async (cartItems) => {
    if (!get().ready) {
      console.warn("⛔ Products not ready, skipping stock subtraction");
      return;
    }

    set((state) => {
      const updatedProducts = state.products.map((product) => {
        const orderedItem = cartItems.find(
          (item) => item.id === product.serverId
        );
        if (!orderedItem) return product;

        const newStock = Math.max(
          0,
          product.stock - orderedItem.quantity
        );

        updateProductStockDB(product.serverId, newStock);

        return { ...product, stock: newStock };
      });

      return { products: updatedProducts };
    });
  },

  fetchProductsFromAPI: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId || !navigator.onLine) return;

    const res = await api.get(`/tenant/purchase/productList/${outletId}`);
    const apiData = res.data.data;

    const products = aggregateInventoryToProducts(apiData, outletId);

    for (const product of products) {
      await upsertProductDB(product);
    }

    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId),
    });
  },
}));
