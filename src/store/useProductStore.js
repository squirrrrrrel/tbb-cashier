import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import { getProductsDB, updateProductStockDB } from "../db/productsDB";
import { aggregateInventoryToProducts } from "../utils/productAggregator";

export const useProductStore = create((set, get) => ({
  products: [],
  hydrated: false,
   setProducts: (products) => set({ products }),

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

   // 🔻 SUBTRACT STOCK LOCALLY
  subtractStockLocal: async (cartItems) => {
    set((state) => {
      const updatedProducts = state.products.map((product) => {
        const orderedItem = cartItems.find(
          (item) => item.id === product.serverId 
        );
        console.log("Updating stock for product:", product.serverId, "Ordered item:", orderedItem);
        if (!orderedItem) return product;

        const newStock = Math.max(
          0,
          product.stock - orderedItem.quantity
        );

        // 🔁 update IndexedDB async (fire & forget)
        updateProductStockDB(product.localId, newStock);

        return {
          ...product,
          stock: newStock,
        };
      });
      //setProducts(updatedProducts);
      set({ products: updatedProducts });
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
      await updateProductStockDB(product.serverId, product.stock); // idempotent
    }

    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId),
    });
  },
}));
