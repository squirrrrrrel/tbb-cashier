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
      const { user } = (await import("./useAuthStore")).useAuthStore.getState();

      const payload = {
        outlet_id: user?.outlet_id || "",
        customer_id: order.cartData.customer?.id || order.cartData.customer?.serverId || "",
        table_id: order.cartData.table?.id || order.cartData.table?.serverId || "",
        order_details: {
          items: (order.cartData.orderItems || []).map((item) => ({
            product_id: item.id || item.serverId,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.cartData.subtotal || 0,
          tax: order.cartData.taxAmount || 0,
          discount: order.cartData.discount?.value || 0,
          total: order.cartData.totalAmountToPay || 0,
        },
        // client_hold_id: order.localId,
        // note: order.note,
      };

      const res = await api.post("/hold-order", payload);

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
