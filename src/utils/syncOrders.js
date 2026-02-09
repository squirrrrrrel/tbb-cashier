import api from "../utils/api";
import { getPendingOrdersDB, markOrderSyncedDB} from "../db/ordersDB";
import { mapOrderToApiPayload } from "./orderMapper";
import { useAuthStore } from "../store/useAuthStore";

export const syncPendingOrders = async () => {
  if (!navigator.onLine) return;

  const pending = await getPendingOrdersDB();
  if (pending.length === 0) return;
  //console.log(`🔄 Syncing ${pending.length} pending orders...`);
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    console.warn("⚠️ Cannot sync orders: no user ID");
    return;
  }

  for (const order of pending) {
    try {
      // Map local order format to API payload format
       
      const payload = mapOrderToApiPayload(order, userId);
      
      console.log("🔄 Syncing order:", order.localId);
      const res = await api.post("/outlet/order", payload, {
        headers: { "Content-Type": "application/json" }
      });
      
      // Extract server order ID from response
      const serverOrderId =
        res.data?.data?.orderId || //  MAIN
        res.data?.data?.id ||      // fallback
        res.data?.orderId ||       // fallback
        null;
      
      if (serverOrderId) {
        await markOrderSyncedDB(order.localId, serverOrderId);
       // await deleteLocalUnsyncedOrdersDB();
        console.log("✅ Order synced successfully:", order.localId, "→", serverOrderId);
      } else {
        console.warn("⚠️ No server order ID in response:", res.data);
      }
    } catch (err) {
      console.error("❌ Order sync failed for", order.localId, ":", err.response?.data || err.message);
      // Continue with other orders even if one fails
    }
  }
};
