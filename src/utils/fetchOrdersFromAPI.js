import api from "../utils/api";
import { saveOrderDB, getAllOrdersDB } from "../db/ordersDB";
import { useAuthStore } from "../store/useAuthStore";

export const fetchOrdersFromAPI = async () => {
  if (!navigator.onLine) return;

  const outletId = useAuthStore.getState().user?.outlet_id;
  const res = await api.get("/outlet/order?outletId=" + outletId);
  const apiOrders = res.data.data;
 //console.log("API ORDERS:", apiOrders);
  const localOrders = await getAllOrdersDB();
  const byServerId = new Map(
    localOrders
      .filter(o => o.localId.startsWith("order-"))
      .map(o => [o.localId, o])
  );
 //  console.log("API ORDERS:", apiOrders);
  for (const apiOrder of apiOrders) {
    const existing = byServerId.get(apiOrder.orderId);

    if (existing) {
      // 🔁 merge server fields only
      await saveOrderDB({
        ...existing,
       // ...apiOrder,
        status: apiOrder.status,
        refundedAmount: apiOrder.refundedAmount,
        invoiceNo: apiOrder.invoice_no,
        updatedAt: Date.now(),
      });
    } else {
      // 🆕 order from another device
      await saveOrderDB({
        localId: `server-${apiOrder.orderId}`,
        serverOrderId: apiOrder.orderId,
        isSynced: true,
        source: "ONLINE",
        createdAt: new Date(apiOrder.createdAt).getTime(),
        ...apiOrder,
      });
    }
  }
};
