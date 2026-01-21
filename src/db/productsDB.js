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
  return db.getAll(STORE);
};

export const upsertProductDB = async (product) => {
  const db = await dbPromise;
  await db.put(STORE, product);   // put = upsert
};

export const deleteProductDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
};
