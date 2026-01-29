import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // ===== DATA =====
      selectedCustomer: null,
      selectedTable: null,
      cartData: [],        // SINGLE SOURCE OF TRUTH
      orderData: {},

      // ===== CART ACTIONS =====
      addToCart: (product) => {
  const state = get();
  const existing = state.cartData.find(p => p.id === product.id);

  // ⛔ OUT OF STOCK CHECK
  if(product.categoryName === "Butchery") {
    if (existing && existing.quantity + product.quantity > product.stock + product.stockQueue) {
    return { success: false, reason: "OUT_OF_STOCK" };
    }
  }else{
    if (existing && existing.quantity >= product.stock + product.stockQueue) {
    return { success: false, reason: "OUT_OF_STOCK" };
  }
  }
  set(() => {
    if (existing) {
      return {
        cartData: state.cartData.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.categoryName === "Butchery" ? product.quantity + p.quantity : p.quantity + 1 }
            : p
        ),
      };
    }

    return {
      cartData: [...state.cartData, { ...product, quantity: product.quantity || 1 }],
    };
  });

  return { success: true };
},


      removeFromCart: (id) =>
        set((state) => ({
          cartData: state.cartData.filter(p => p.id !== id),
        })),

      // updateQuantity: (id, quantity) =>
      //   set((state) => ({
      //     cartData: state.cartData.map(p =>
      //       p.id === id ? { ...p, quantity } : p
      //     ),
      //   })),
updateQuantity: (id, quantity) =>
  set((state) => {
    return {
      cartData: state.cartData.map(p => {
        if (p.id !== id) return p;

        // ⛔ STOCK GUARD
        const safeQty = Math.min(
          Math.max(1, quantity), // minimum 1
          p.stock + p.stockQueue               // maximum stock
        );

        return { ...p, quantity: safeQty };
      }),
    };
  }),
      // ===== OTHER =====
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setSelectedTable: (table) => set({ selectedTable: table }),
      setOrderData: (data) => set({ orderData: data }),

      resetCart: () =>
        set({
          selectedCustomer: null,
          selectedTable: null,
          cartData: [],
          orderData: {},
        }),
    }),
    {
      name: "pos-storage",
    }
  )
);
