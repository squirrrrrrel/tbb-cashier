import api from "../utils/api";
import { createOfflineOrder } from "./createOfflineOrder";
import { useProductStore } from "../store/useProductStore";
import { useAuthStore } from "../store/useAuthStore";
import { saveOrderDB, markOrderSyncedDB } from "../db/ordersDB";
import { v4 as uuid } from "uuid";
import { fetchOrdersFromAPI } from "./fetchOrdersFromAPI";
import { getProductByServerIdDB, softDeleteProductDB } from "../db/productsDB";


const softDeleteZeroStockAfterOrder = async (cartData) => {
  for (const item of cartData) {
    const productId = item.id || item.productId;
    const product = await getProductByServerIdDB(productId);
    if (!product) continue;

    const totalStock = Number(product.stock || 0) + Number(product.stockQueue || 0);
    if (totalStock <= 0) {
      await softDeleteProductDB(productId);
    }
  }
};
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

  const localOrder = {
    localId: uuid(),
    isSynced: false,
    source: navigator.onLine ? "ONLINE" : "OFFLINE",
    createdAt: Date.now(),
    outletId,

    customerId: customer?.serverId || null,
    tableId: table?.serverId || null,
    cartData,
    totals,
    paymentMethods,
    tenderedAmount,
    cashReturned,
  };
  // await saveOrderDB(localOrder);
  // 🟢 ONLINE FLOW
  if (navigator.onLine) {
    try {
      const payload = {
        customer: customer? {
          id: customer.serverId || null,
          first_name: customer.first_name || customer.firstName || null,
          last_name: customer.last_name || customer.lastName || null,
          email: customer.email || null,
          phone_code: customer.phone_code || customer.phoneCode || null,
          phone_number: customer.phone_number || customer.phoneNumer || null,
        } : null,
        table_id: table?.serverId || null,
        subtotal: totals.subtotal,
        outlet_id: outletId || null,
        discountAmount: totals?.discount || 0,
        discount_percentage: totals?.discount_percentage,
        taxAmount: totals.taxAmount || totals.tax || 0,
        amount: totals.amount || totals.total || 0,
        paymentMethods,
        tenderedAmount,
        cashReturned,
        orderItems: cartData.map((p) => {
          const unitPrice = p.price || p.unitPrice || p.sellingPrice || 0;
          const qty = p.quantity || 0;
          const shots = p.shots || 0;

          // Item total before discount+tax
          const rawTotal = p.unit === "ml"
            ? unitPrice * shots * qty
            : unitPrice * qty;

          // Use order-level discount rate (same as Dashboard)
          const discountRate = (totals?.discount_percentage || 0) / 100;
          const discountedTotal = rawTotal * (1 - discountRate);
          const discountAmount = rawTotal * discountRate;

          // Tax on discounted price
          const taxRate = Number(p.tax || p.taxPercentage || p.tax_percentage_per_product || 0);
          const taxAmountPerProduct = (discountedTotal * taxRate) / 100;

          return {
            productId: p.id || p.productId,
            product_name: p.name,
            unitPrice,
            quantity: qty,
            shots,
            unit: p.unit || null,
            taxAmountPerProduct,
            discount: discountAmount,
            tax_percentage_per_product: taxRate,
          };
        }),
      };

      const res = await api.post("/outlet/order", payload);

      // 🔄 refresh stock from server
      // await productStore.fetchProductsFromAPI();
      // await fetchOrdersFromAPI();
      await softDeleteZeroStockAfterOrder(cartData);
      const serverOrderId = res.data?.data?.orderId;
      if (serverOrderId) {
        await markOrderSyncedDB(localOrder.localId, serverOrderId);
      }

      // await productStore.fetchProductsFromAPI();
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
