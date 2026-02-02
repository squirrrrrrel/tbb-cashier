import { create } from "zustand";
import {
  getHoldOrdersDB,
  upsertHoldOrderDB,
  deleteHoldOrderDB,
} from "../db/holdOrdersDB";
import api from "../utils/api";

export const useHoldOrderStore = create((set, get) => ({
  holdOrders: [],
  hydrated: false,

  loadHoldOrdersFromDB: async () => {
    const orders = await getHoldOrdersDB();
    set({ holdOrders: orders, hydrated: true });
  },

  createHoldOrder: async (order) => {
    // 1️⃣ Save locally first
    await upsertHoldOrderDB(order);
    set({ holdOrders: await getHoldOrdersDB() });

    // 2️⃣ Sync to backend (non-blocking)
    try {
      const res = await api.post("/hold-orders", {
        client_hold_id: order.localId,
        cartData: order.cartData,
        note: order.note,
      });

      await upsertHoldOrderDB({
        ...order,
        serverId: res.data.id,
        isSynced: true,
      });

      set({ holdOrders: await getHoldOrdersDB() });
    } catch (e) {
      // Offline / failed → retry later
      console.warn("Hold order sync pending");
    }
  },

  resumeHoldOrder: async (order) => {
    // 1️⃣ Remove locally
    await deleteHoldOrderDB(order.localId);
    set({ holdOrders: await getHoldOrdersDB() });

    // 2️⃣ Remove from backend
    if (order.serverId) {
      try {
        await api.delete(`/hold-orders/${order.serverId}`);
      } catch (e) {
        console.warn("Backend delete failed");
      }
    }
  },
}));
