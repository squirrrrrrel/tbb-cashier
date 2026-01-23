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
      addToCart: (product) =>
        set((state) => {
          const existing = state.cartData.find(p => p.id === product.id);

          if (existing) {
            return {
              cartData: state.cartData.map(p =>
                p.id === product.id
                  ? { ...p, quantity: p.quantity + 1 }
                  : p
              ),
            };
          }

          return {
            cartData: [...state.cartData, { ...product, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cartData: state.cartData.filter(p => p.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cartData: state.cartData.map(p =>
            p.id === id ? { ...p, quantity } : p
          ),
        })),

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
