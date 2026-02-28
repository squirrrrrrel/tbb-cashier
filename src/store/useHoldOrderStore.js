import { create } from "zustand";
import {
  getHoldOrdersDB,
  upsertHoldOrderDB,
  deleteHoldOrderDB,
  clearHoldOrdersDB,
  bulkUpsertHoldOrdersDB,
} from "../db/holdOrdersDB";
import api from "../utils/api";
import { useProductStore } from "./useProductStore";

export const useHoldOrderStore = create((set, get) => ({
  holdOrders: [],
  hydrated: false,
  loading: false,
  isSyncing: false,

  loadHoldOrdersFromDB: async () => {
    const orders = await getHoldOrdersDB();
    set({ holdOrders: orders, hydrated: true });
  },

  /* ================= SYNC PENDING ================= */
  syncPendingHoldOrders: async () => {
    if (!navigator.onLine || get().isSyncing) return;

    set({ isSyncing: true });

    try {
      const allOrders = await getHoldOrdersDB();
      const pending = allOrders.filter((o) => !o.isSynced);
      if (!pending.length) {
        set({ isSyncing: false });
        return;
      }

      const { user } = (await import("./useAuthStore")).useAuthStore.getState();

      for (const order of pending) {
        try {
          const payload = {
            outlet_id: user?.outlet_id || "",
            customer_id: order.cartData.customer?.id || order.cartData.customer?.serverId || null,
            customer_name: order.note || "",
            table_id: order.cartData.table?.id || order.cartData.table?.serverId || null,
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
          };

          const res = await api.post("/hold-order", payload);

          // Delete old local record — fetchHoldOrders will re-insert with server UUID
          await deleteHoldOrderDB(order.localId);
          console.log(`✅ Synced pending hold order: ${order.localId}`);
        } catch (e) {
          console.warn(`⚠️ Failed to sync hold order ${order.localId}:`, e);
        }
      }

      set({ holdOrders: await getHoldOrdersDB() });
    } finally {
      set({ isSyncing: false });
    }
  },

  /* ================= FETCH (GET) ================= */
  fetchHoldOrders: async (outletId) => {
    if (!navigator.onLine || !outletId) return;

    // 1️⃣ Sync any pending offline orders first
    await get().syncPendingHoldOrders();

    set({ loading: true });
    try {
      const res = await api.get(`/hold-order`, { params: { outlet_id: outletId } });
      const apiData = res?.data?.data || res?.data || [];

      // Map API response to local format with localId for IndexedDB keyPath
      const mapped = apiData.map((o) => ({
        localId: o.id,
        serverId: o.id,
        isSynced: true,
        timestamp: o.createdAt,
        note: o.customer_name,
        cartData: {
          customer: o.customer_id ? {
            id: o.customer_id,
            serverId: o.customer_id,
            localId: o.customer_id,
            firstName: o.customerFirstName || "",
            lastName: o.customerLastName || "",
            phoneCode: o.customerPhoneCode || "",
            phoneNumber: o.customerPhone || "",
          } : null,
          table: o.table_id ? {
            id: o.table_id,
            serverId: o.table_id,
            localId: o.table_id,
            tableNumber: o.table_number || "",
          } : null,
          orderItems: (() => {
            const allProducts = useProductStore.getState().products;
            return (o.order_details?.items || []).map((item) => {
              const product = allProducts.find(
                (p) => p.serverId === item.product_id
              );
              return {
                ...item,
                id: item.product_id,
                serverId: item.product_id,
                name: item.product_name || product?.name || "",
                img: item.image_url || product?.img || "",
                tax: product?.tax || 0,
                stock: product?.stock || 0,
                stockQueue: product?.stockQueue || 0,
                categoryName: product?.categoryName || "",
                unit: product?.unit || "",
              };
            });
          })(),
          subtotal: o.order_details?.subtotal || 0,
          taxAmount: o.order_details?.tax || 0,
          discount: { value: o.order_details?.discount || 0 },
          totalAmountToPay: o.order_details?.total || 0,
        },
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));

      // 2️⃣ Preserve any remaining unsynced local orders (failed sync)
      const localOrders = await getHoldOrdersDB();
      const stillPending = localOrders.filter((o) => !o.isSynced);

      await clearHoldOrdersDB();
      await bulkUpsertHoldOrdersDB([...mapped, ...stillPending]);
      set({ holdOrders: [...mapped, ...stillPending], loading: false });
    } catch (err) {
      console.error("Failed to fetch hold orders:", err);
      set({ loading: false });
    }
  },

  /* ================= CREATE (POST) ================= */
  createHoldOrder: async (order) => {
    // 1️⃣ Save locally first
    await upsertHoldOrderDB(order);
    set({ holdOrders: await getHoldOrdersDB() });

    // 2️⃣ Sync to backend (non-blocking)
    try {
      const { user } = (await import("./useAuthStore")).useAuthStore.getState();

      const payload = {
        outlet_id: user?.outlet_id || "",
        customer_id: order.cartData.customer?.id || order.cartData.customer?.serverId || null,
        customer_name: order.note || "",
        table_id: order.cartData.table?.id || order.cartData.table?.serverId || null,
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
      };

      const res = await api.post("/hold-order", payload);

      // Delete old local record (HOLD-xxx) and save with server UUID as localId
      await deleteHoldOrderDB(order.localId);
      await upsertHoldOrderDB({
        ...order,
        localId: res.data.id,
        serverId: res.data.id,
        isSynced: true,
      });

      set({ holdOrders: await getHoldOrdersDB() });
    } catch (e) {
      // Offline / failed → retry later via syncPendingHoldOrders
      console.warn("Hold order sync pending — will retry when online");
    }
  },

  /* ================= UPDATE (PUT) ================= */
  updateHoldOrder: async (order, updatedCartData) => {
    // 1️⃣ Update locally first
    const updated = { ...order, cartData: updatedCartData, timestamp: new Date().toISOString() };
    await upsertHoldOrderDB(updated);
    set({ holdOrders: await getHoldOrdersDB() });

    // 2️⃣ Sync to backend
    if (order.serverId) {
      try {
        const { user } = (await import("./useAuthStore")).useAuthStore.getState();

        const payload = {
          id: order.serverId,
          outlet_id: user?.outlet_id || "",
          customer_id: updatedCartData.customer?.id || updatedCartData.customer?.serverId || null,
          customer_name: updated.note || "",
          table_id: updatedCartData.table?.id || updatedCartData.table?.serverId || null,
          order_details: {
            items: (updatedCartData.orderItems || []).map((item) => ({
              product_id: item.id || item.serverId,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: updatedCartData.subtotal || 0,
            tax: updatedCartData.taxAmount || 0,
            discount: updatedCartData.discount?.value || 0,
            total: updatedCartData.totalAmountToPay || 0,
          },
        };

        await api.put(`/hold-order/${order.serverId}`, payload);

        await upsertHoldOrderDB({ ...updated, isSynced: true });
        set({ holdOrders: await getHoldOrdersDB() });
      } catch (e) {
        console.warn("Hold order update sync failed:", e);
      }
    }
  },

  /* ================= DELETE ================= */
  resumeHoldOrder: async (order) => {
    // 1️⃣ Remove locally
    await deleteHoldOrderDB(order.localId);
    set({ holdOrders: await getHoldOrdersDB() });

    // 2️⃣ Remove from backend
    if (order.serverId) {
      try {
        const { user } = (await import("./useAuthStore")).useAuthStore.getState();
        await api.delete(`/hold-order/${order.serverId}`, {
          params: { outlet_id: user?.outlet_id },
        });
      } catch (e) {
        console.warn("Backend delete failed:", e);
      }
    }
  },
}));
