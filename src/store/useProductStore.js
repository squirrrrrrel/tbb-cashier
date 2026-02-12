import { create } from "zustand";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import { getProductsDB, updateProductStockDB ,upsertProductDB, softDeleteProductDB} from "../db/productsDB";
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
      products: local.filter(p => p.outletId === outletId && p.stock > 0),
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
  // subtractStockLocal: async (cartItems) => {
  //   if (!get().ready) {
  //     console.warn("⛔ Products not ready, skipping stock subtraction");
  //     return;
  //   }

  //   set((state) => {
  //     const updatedProducts = state.products.map((product) => {
  //       const orderedItem = cartItems.find(
  //         (item) => item.id === product.serverId
  //       );
  //       if (!orderedItem) return product;

  //       const newStock = Math.max(
  //         -1,
  //         product.stock - orderedItem.quantity
  //       );

  //       updateProductStockDB(product.serverId, newStock);

  //       return { ...product, stock: newStock };
  //     });

  //     return { products: updatedProducts};
  //   });
  // },
  // CURRENT
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
        -1,
        product.stock - orderedItem.quantity
      );

      updateProductStockDB(product.serverId, newStock);

      return { ...product, stock: newStock };
    });

    return { products: updatedProducts };
  });
},

// FIXED
subtractStockLocal: async (cartItems) => {
  if (!get().ready) {
    console.warn("Products not ready, skipping stock subtraction");
    return;
  }

  const zeroStockIds = [];

  set((state) => {
    const updatedProducts = state.products.map((product) => {
      const orderedItem = cartItems.find(
        (item) => item.id === product.serverId
      );
      if (!orderedItem) return product;

      const newStock = Math.max(0, product.stock - orderedItem.quantity);

      updateProductStockDB(product.serverId, newStock);

      if (newStock <= 0) {
        zeroStockIds.push(product.serverId);
      }

      return { ...product, stock: newStock };
    });

    // Filter out zero-stock products from Zustand state
    return { products: updatedProducts.filter((p) => p.stock > 0) };
  });

  // Soft delete zero-stock products from IndexedDB
  for (const serverId of zeroStockIds) {
    await softDeleteProductDB(serverId);
  }
},

fetchProductsFromAPI: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId || !navigator.onLine) return;

    const res = await api.get(`/tenant/purchase/productList/${outletId}`);
    const apiData = res.data.data;

    const products = aggregateInventoryToProducts(apiData, outletId);

    // Get current products from IndexedDB before upserting
    const existingLocal = await getProductsDB();
    const existingForOutlet = existingLocal.filter(p => p.outletId === outletId);

    // Collect serverIds returned by API
    const apiServerIds = new Set(products.map(p => p.serverId));

    // Soft delete products that API no longer returns (fully sold out)
    for (const localProduct of existingForOutlet) {
      if (!apiServerIds.has(localProduct.serverId)) {
        await softDeleteProductDB(localProduct.serverId);
      }
    }

    // Upsert products the API returned
    for (const product of products) {
      await upsertProductDB(product);
    }

    const local = await getProductsDB();
    set({
      products: local.filter(p => p.outletId === outletId && p.stock > 0),
    });
  },
}));
