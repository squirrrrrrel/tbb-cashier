import { openDB } from "idb";

const DB_NAME = "pos-products-db";
const STORE = "products";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: "localId" });
      store.createIndex("serverId", "serverId", { unique: true });
      store.createIndex("outletId", "outletId", { unique: false });
    }
  },
});

export const getProductsDB = async () => {
  const db = await dbPromise;
  const all = await db.getAll(STORE);
  return all.filter((p) => {
    if (p.is_deleted) return false;
    const totalStock = Number(p.stock || 0) + Number(p.stockQueue || 0);
    if (totalStock <= 0) return false;
    return true;
  });
};

export const updateProductStockDB = async (serverId, newStock) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const index = store.index("serverId");

  const product = await index.get(serverId);
  if (!product) {
    console.warn("⚠️ Product not found in IndexedDB:", serverId);
    return;
  }

  product.stock = Math.max(-1, Number(newStock));
  product.updatedAt = Date.now();
  product.isSynced = false; 

  await store.put(product);
  await tx.done;
};


export const upsertProductDB = async (product) => { 
  const db = await dbPromise; 
  await db.put(STORE, product); 
};

export const deleteProductDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
};
export const getProductByServerIdDB = async (serverId) => {
  const db = await dbPromise;

  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const index = store.index("serverId");

  const product = await index.get(serverId);
  await tx.done;

  return product || null;
};

export const softDeleteProductDB = async (serverId) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const index = store.index("serverId");

  const product = await index.get(serverId);
  if (!product) {
    console.warn("Product not found for soft delete:", serverId);
    return;
  }

  product.is_deleted = true;
  product.deletedAt = Date.now();
  product.isSynced = false;

  await store.put(product);
  await tx.done;
};
