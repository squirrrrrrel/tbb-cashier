import { openDB } from "idb";

const DB_NAME = "pos-lowstock-db";
const STORE = "lowStock";

const dbPromise = openDB(DB_NAME, 3, {
  upgrade(db, oldVersion) {
    if (oldVersion < 3) {
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      db.createObjectStore(STORE, { keyPath: "productId"});
    }
  },
});

export const getLowStockDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const upsertLowStockDB = async (item) => {
  const db = await dbPromise;
  await db.put(STORE, item);
};

export const clearLowStockByOutletDB = async (outletId) => {
  const db = await dbPromise;
  const all = await db.getAll(STORE);
  for (const item of all) {
    if (item.outletId === outletId) {
      await db.delete(STORE, item.productId);
    }
  }
};
