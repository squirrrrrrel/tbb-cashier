import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // --- DATA ---
      selectedCustomer: null, // { id, name, phone }
      selectedTable: null,    // { id, tableName, section }
      cartData: [],       // [{ id, name, price, quantity }]
      orderData: {},           // { orderId, {customer}, [orderItems], total, change, tenderedAmount, cashierName}

      // --- ACTIONS ---

      // Select a Customer
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

      // Select a Table
      setSelectedTable: (table) => set({ selectedTable: table }),

      //set cart data
      setCartData: (cartData) =>set((state) => ({ ...state, cartData })),

    // set order data
    setOrderData: (data) => set({ orderData: data }),

    // Reset everything after payment
    resetCart: () => set({
      selectedCustomer: null,
      selectedTable: null,
      orderData: {},
      cartData: []
    }),
    }),
{
  name: 'pos-storage', // Key for localStorage
    getStorage: () => localStorage, // Saves cart/table if page refreshes
    }
  )
);