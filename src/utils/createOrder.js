import api from "../utils/api";
import { createOfflineOrder } from "./createOfflineOrder";
import { useProductStore } from "../store/useProductStore";
import { useAuthStore } from "../store/useAuthStore";

export const createOrder = async ({
  cartData,
  customer,
  table,
  totals,
  paymentMethods,
  tenderedAmount,
  cashReturned,
}) => {
  const productStore = useProductStore.getState();
  const outletId = useAuthStore.getState().user?.outlet_id;
  // 🟢 ONLINE FLOW
  if (navigator.onLine) {
    try {
      const payload = {
        customer_id: customer?.serverId || null,
        table_id: table?.serverId || null,
        subtotal: totals.subtotal,
        outlet_id: outletId || null,
        discountAmount: 0,
        discount_percentage:  null,
        taxAmount: totals.taxAmount || totals.tax || 0,
        amount: totals.amount || totals.total || 0,
        paymentMethods,
        tenderedAmount,
        cashReturned,
        orderItems: cartData.map((p) => ({
         productId: p.id || p.productId,
         unitPrice: p.unitPrice || p.price || p.sellingPrice || 0,
         quantity: p.quantity || 0,
         unit: p.unit || null,
         discount: p.discount || 0,
         tax_percentage_per_product: Number(p.tax_percentage_per_product || p.taxPercentage || 0),
      
        })),
      };

      const res = await api.post("/outlet/order", payload);

      // 🔄 refresh stock from server
      await productStore.fetchProductsFromAPI();

      return {
        mode: "online",
        orderId: res.data?.data?.orderId,
        order: res.data?.data,
      };
    } catch (err) {
      console.warn("⚠️ Online order failed → falling back to offline");
    }
  }

  // 🔴 OFFLINE FALLBACK
  const offlineOrder = await createOfflineOrder({
    cartData,
    customer,
    table,
    totals,
    paymentMethods,
    tenderedAmount,
    cashReturned,
  });

  // subtract stock ONLY offline
  await productStore.subtractStockLocal(cartData);

  return {
    mode: "offline",
    orderId: offlineOrder.localId,
    order: offlineOrder,
  };
};
