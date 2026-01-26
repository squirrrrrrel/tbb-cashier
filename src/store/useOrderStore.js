// import { create } from "zustand";
// import { getAllOrdersDB } from "../db/ordersDB";
// import { useAuthStore } from "./useAuthStore";
// export const useOrderStore = create((set) => ({
//   orders: [],
//   loading: false,
//   // hydrate : async () => {
//   //   const outletId = useAuthStore.getState().user?.outlet_id;
//   //       if (!outletId) {
//   //         set({ hydrated: true });
//   //         return;
//   //       }
//   // },
//   loadOrdersFromDB: async () => {
//     set({ loading: true });
//     const orders = await getAllOrdersDB();
//     // const outletId = useAuthStore.getState().user?.outlet_id;
//     //     if (!outletId) {
//     //       set({ hydrated: true });
//     //       return;
//     //     }
//     set({ orders, loading: false });
//   },
// }));


import { create } from "zustand";
import { getAllOrdersDB } from "../db/ordersDB";

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,

  loadOrdersFromDB: async () => {
    set({ loading: true });
    try {
      const orders = await getAllOrdersDB();
      set({ orders: orders || [], loading: false });
    } catch (err) {
      console.error("❌ Failed to load orders", err);
      set({ orders: [], loading: false });
    }
  },

  // ✅ REQUIRED for refunds / exchange
  setOrders: (updater) =>
    set((state) => ({
      orders:
        typeof updater === "function"
          ? updater(state.orders)
          : updater,
    })),
}));
