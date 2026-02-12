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
      managerDiscount: 0,

      // ===== CART ACTIONS =====
      // addToCart: (product) => {
      //   console.log(product);

      //   const state = get();
      //   const existing = state.cartData.find(p => p.id === product.id);

      //   // ⛔ OUT OF STOCK CHECK
      //   if (product.categoryName === "Butchery") {
      //     if (existing && existing.quantity + product.quantity > product.stock + product.stockQueue) {
      //       return { success: false, reason: "OUT_OF_STOCK" };
      //     }
      //   } else {
      //     if (existing && existing.quantity >= product.stock + product.stockQueue) {
      //       return { success: false, reason: "OUT_OF_STOCK" };
      //     }
      //   }
      //   set(() => {
      //     if (existing) {
      //       return {
      //         cartData: state.cartData.map(p =>
      //           p.id === product.id
      //             ? { ...p, quantity: p.categoryName === "Butchery" ? product.quantity + p.quantity : p.quantity + 1 }
      //             : p
      //         ),
      //       };
      //     }

      //     return {
      //       cartData: [...state.cartData, { ...product, quantity: product.quantity || 1 }],
      //     };
      //   });

      //   return { success: true };
      // },


      // removeFromCart: (id) =>
      //   set((state) => {
      //     const newCartData = state.cartData.filter((p) => p.id !== id);
      //     return {
      //       cartData: newCartData,
      //       // If newCart is empty, reset managerDiscount
      //       managerDiscount: newCartData.length === 0 ? 0 : state.managerDiscount,
      //     };
      //   }),

      // updateQuantity: (id, quantity) =>
      //   set((state) => {
      //     return {
      //       cartData: state.cartData.map(p => {
      //         if (p.id !== id) return p;

      //         // ⛔ STOCK GUARD
      //         const safeQty = Math.min(
      //           Math.max(1, quantity), // minimum 1
      //           p.stock + p.stockQueue               // maximum stock
      //         );

      //         return { ...p, quantity: safeQty };
      //       }),
      //     };
      //   }),
// useCartStore.ts

addToCart: (product) => {
  const state = get();

  // For shot products (ml), treat different quantities as separate line items
  if (product.unit === "ml") {
    const existing = state.cartData.find(
      (p) => p.id === product.id && Number(p.quantity) === Number(product.quantity)
    );

    if (existing) {
      const totalShotsInCart = state.cartData
    .filter((p) => p.id === product.id)
    .reduce((sum, p) => sum + ((Number(p.shots) || 1) * Number(p.quantity)), 0);

  if (totalShotsInCart * Number(existing.quantity) >= Number(product.stockQueue) + Number(product.quantity)) {
    return { success: false, reason: "OUT_OF_STOCK" };
  }
   set(() => ({
    cartData: state.cartData.map((p) =>
      p.id === product.id && Number(p.quantity) === Number(product.quantity)
        ? { ...p, shots: (Number(p.shots) || 1) + 1 }
        : p
    ),
  }));
  return { success: true };
}

    // Same product but different ml quantity -> add as a new line item
    const cartKey = `${product.id}_${product.quantity}ml_${Date.now()}`;
    set(() => ({
      cartData: [
        ...state.cartData,
        { ...product, cartKey, shots: product.shots || 1 },
      ],
    }));
    return { success: true };
  }

  // --- Non-shot products (existing logic) ---
  const existing = state.cartData.find((p) => p.id === product.id);

  if (product.categoryName === "Butchery") {
    if (existing && existing.quantity + product.quantity > product.stock + product.stockQueue) {
      return { success: false, reason: "OUT_OF_STOCK" };
    }
  } else {
    if (existing && existing.quantity >= product.stock + product.stockQueue) {
      return { success: false, reason: "OUT_OF_STOCK" };
    }
  }

  set(() => {
    if (existing) {
      return {
        cartData: state.cartData.map((p) =>
          p.id === product.id
            ? {
                ...p,
                quantity:
                  p.categoryName === "Butchery"
                    ? product.quantity + p.quantity
                    : p.quantity + 1,
              }
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

// Updated updateQuantity to accept shots
updateQuantity: (id, quantity, shots) =>
  set((state) => ({
    cartData: state.cartData.map((p) => {
      const isMatch = p.cartKey ? p.cartKey === id : p.id === id;
      if (!isMatch) return p;

      const safeQty = Math.min(
        Math.max(1, quantity),
        p.stock + p.stockQueue
      );

      return {
        ...p,
        quantity: safeQty,
        ...(shots !== undefined && { shots }),
      };
    }),
  })),

// Updated removeFromCart to work with cartKey for shot items
removeFromCart: (id, cartKey) =>
  set((state) => {
    const newCartData = cartKey
      ? state.cartData.filter((p) => p.cartKey !== cartKey)
      : state.cartData.filter((p) => p.id !== id);
    return {
      cartData: newCartData,
      managerDiscount: newCartData.length === 0 ? 0 : state.managerDiscount,
    };
  }),
      setCartFromHold: (cartData) =>
        set({
          cartData: cartData.orderItems,
          selectedCustomer: cartData.customer || null,
          selectedTable: cartData.table || null,
        }),
      // ===== OTHER =====
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setSelectedTable: (table) => set({ selectedTable: table }),
      setOrderData: (data) => set({ orderData: data }),
      setManagerDiscount: (data) => set({ managerDiscount: data }),

      resetCart: () =>
        set({
          selectedCustomer: null,
          selectedTable: null,
          cartData: [],
          //orderData: {},
          managerDiscount: 0
        }),
      clearOrderData: () => set({ orderData: null }),

    }),
    {
      name: "pos-storage",
    }
  )
);
