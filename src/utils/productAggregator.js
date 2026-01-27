export const aggregateInventoryToProducts = (apiData, outletId) => {
  const map = new Map();

  for (const item of apiData) {
    const productId = item.product_id;

    if (!map.has(productId)) {
      map.set(productId, {
        localId: `product-${productId}`,   //deterministic key
        serverId: productId,
        outletId,

        name: item.product.product_name,
        barcode: item.product.barcode,
        categoryId: item.product.category_id,
        categoryName: item.product.category_name,
        img: item.product.image_url,

        unit: item.unit,

        stock: Number(item.quantity),
        stockQueue: Number(item.remaining_quantity || 0),

        lowStockThreshold: item.low_stock_threshold || 5,
        sellingPrice: Number(item.selling_price),

        updatedAt: Date.now(),
      });
    } else {
      //aggregate batches
      map.get(productId).stock += Number(item.remaining_quantity);
    }
  }

  return Array.from(map.values()).map(p => ({
    ...p,
    isLowStock: p.stock <= p.lowStockThreshold,
  }));
};
