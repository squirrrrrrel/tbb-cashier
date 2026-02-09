import { saveOrderDB } from "../db/ordersDB";
import { v4 as uuid } from "uuid";
import { useAuthStore } from "../store/useAuthStore";

export const createOfflineOrder = async ({
  cartData,
  customer,
  table,
  totals,
  paymentMethods = [],
  tenderedAmount = [],
  cashReturned = 0,
  discount_percentage = null,
}) => {
  const outletId = useAuthStore.getState().user?.outlet_id;
  
  const order = {
    localId: uuid(),
    createdAt: Date.now(),
    isSynced: false,

    outlet_id: outletId || null,
    customer_id: customer?.serverId || null,
    table_id: table?.serverId || null,

    orderItems: cartData.map(p => ({
      productId: p.id || p.productId,
      name: p.name,
      type: null,
      price: p.price || p.unitPrice || p.sellingPrice || 0,
      unitPrice: p.unitPrice || p.price || p.sellingPrice || 0,
      quantity: p.quantity || 0,
      unit: p.unit || null,
      discount: p.discount || 0,
      tax_percentage_per_product: Number(p.tax_percentage_per_product || p.taxPercentage || 0),
      total: (p.price || p.unitPrice || 0) * (p.quantity || 0),
    })),

    subtotal: totals.subtotal || 0,
    tax: totals.tax || 0,
    taxAmount: totals.taxAmount || totals.tax || 0,
    discount: totals.discount || 0,
    discountAmount: totals.discountAmount || totals.discount || 0,
    discount_percentage: Number(discount_percentage || totals.discount_percentage || 0),
    totalAmount: totals.total || 0,
    amount: totals.amount || totals.total || 0,
    
    payments: paymentMethods,
    tenderedAmount: tenderedAmount,
    cashReturned: cashReturned,
  };

  await saveOrderDB(order);
  return order;
};
