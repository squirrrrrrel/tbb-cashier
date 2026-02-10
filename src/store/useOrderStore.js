// import { create } from "zustand";
// import { getAllOrdersDB } from "../db/ordersDB";

// export const useOrderStore = create((set) => ({
//   orders: [],
//   loading: false,

//   loadOrdersFromDB: async () => {
//     set({ loading: true });
//     try {
//       const orders = await getAllOrdersDB();
//       set({ orders: orders || [], loading: false });
//     } catch (err) {
//       console.error("❌ Failed to load orders", err);
//       set({ orders: [], loading: false });
//     }
//   },

//   // ✅ REQUIRED for refunds / exchange
//   setOrders: (updater) =>
//     set((state) => ({
//       orders:
//         typeof updater === "function"
//           ? updater(state.orders)
//           : updater,
//     })),
// }));


import { create } from "zustand";
import { getAllOrdersDB } from "../db/ordersDB";
import { useAuthStore } from "./useAuthStore";

export const useOrderStore = create((set, get) => ({
  allOrders: [],        // 🔹 raw orders from DB
  orders: [],           // 🔹 filtered by outlet
  loading: false,

  // 🔹 Load once from IndexedDB
  loadOrdersFromDB: async () => {
    set({ loading: true });

    try {
      const allOrders = await getAllOrdersDB();

      const outletId = useAuthStore.getState().user?.outlet_id;

      const filteredOrders = outletId
        ? allOrders.filter(
            (order) => order.outlet_id === outletId
          )
        : [];

      set({
        allOrders: allOrders || [],
        orders: filteredOrders,
        loading: false,
      });
    } catch (err) {
      console.error("❌ Failed to load orders", err);
      set({
        allOrders: [],
        orders: [],
        loading: false,
      });
    }
  },

  // 🔹 Re-filter when outlet changes
  filterByOutlet: (outletId) => {
    const { allOrders } = get();
    set({
      orders: allOrders.filter(
        (order) => order.outlet_id === outletId
      ),
    });
  },

  // 🔹 Used for refund / exchange updates
//  setOrders: (updater) =>
//   set((state) => {
//     const newOrders =
//       typeof updater === "function"
//         ? updater(state.orders)
//         : updater;

//     // Also update the matching orders in allOrders
//     const updatedAllOrders = state.allOrders.map((order) => {
//       const updated = newOrders.find((o) => o._id === order._id || o.localId === order.localId);
//       return updated || order;
//     });

//     return {
//       orders: newOrders,
//       allOrders: updatedAllOrders,
//     };
//   }),
   setOrders: (updater) =>
    set((state) => ({
      orders:
        typeof updater === "function"
          ? updater(state.orders)
          : updater,
    })),
}));