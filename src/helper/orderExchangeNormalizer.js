/**
 * Normalize raw order items (from IndexedDB)
 * into exchangeable items with remainingQuantity
 */
export const normalizeOrderItemsForExchange = (orderItems = []) => {
  const productMap = new Map();

  for (const item of orderItems) {
    const productId = item.productId;

    if (!productMap.has(productId)) {
      productMap.set(productId, {
        baseItem: null,
        soldQty: 0,
        returnedQty: 0,
      });
    }

    const row = productMap.get(productId);

    // Original SALE item
    if (item.type === null || item.type === "SALE" || item.type === "EXCHANGE_NEW") {
      row.baseItem = item;
      row.soldQty += Number(item.quantity || 0);
    }

    // RETURN items
    if (item.type === "RETURN") {
      row.returnedQty += Math.abs(Number(item.quantity || 0));
    }
  }

  // Build final list
  return Array.from(productMap.values())
    .filter(r => r.baseItem) // must have original sale
    .map(r => {
      const remainingQuantity = Math.max(
        0,
        r.soldQty - r.returnedQty
      );

      return {
        ...r.baseItem,
        quantity: remainingQuantity,          // 🔥 IMPORTANT
        remainingQuantity,
      };
    })
    .filter(item => item.remainingQuantity > 0); // hide fully exchanged
};
