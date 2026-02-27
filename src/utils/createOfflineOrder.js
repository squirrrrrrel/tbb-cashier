import { saveOrderDB } from "../db/ordersDB";
import { v4 as uuid } from "uuid";
import { useAuthStore } from "../store/useAuthStore";
import { generateNextOrderId } from "./formatOrderDisplayId";

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
  const { displayId, orderNumber } = generateNextOrderId();
  const outletId = useAuthStore.getState().user?.outlet_id;

  const order = {
    localId: uuid(),
    createdAt: Date.now(),
    isSynced: false,

    display_id: displayId,
    orderNumber: orderNumber,

    outlet_id: outletId || null,
    customer: customer ? {
      id: customer.serverId || null,
      first_name: customer.first_name || customer.firstName || null,
      last_name: customer.last_name || customer.lastName || null,
      email: customer.email || null,
      phone_code: customer.phone_code || customer.phoneCode || null,
      phone_number: customer.phone_number || customer.phoneNumer || null,
    } : null,
    table_id: table?.serverId || null,

    orderItems: cartData.map(p => ({
      productId: p.id || p.productId,
      imageUrl: p.img || p.imageUrl || null,
      product_name: p.name,
      type: null,
      price: p.price || p.unitPrice || p.sellingPrice || 0,
      unitPrice: p.unitPrice || p.price || p.sellingPrice || 0,
      quantity: p.quantity || 0,
      unit: p.unit || null,
      shots: p.shots || 0,
      discount: p.discount || 0,
      tax_percentage_per_product: Number(p.tax_percentage_per_product || p.taxPercentage || 0),
      total: p.unit === "ml" ? (p.price || p.unitPrice || 0) * (p.quantity || 0) * (p.shots || 0) : (p.price || p.unitPrice || 0) * (p.quantity || 0),
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
