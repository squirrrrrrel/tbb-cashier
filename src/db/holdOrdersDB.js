import { openDB } from "idb";

const DB_NAME = "pos-hold-orders-db";
const STORE = "holdOrders";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "localId" });
    }
  },
});

export const getHoldOrdersDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const upsertHoldOrderDB = async (order) => {
  const db = await dbPromise;
  await db.put(STORE, order);
};

export const deleteHoldOrderDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
};
export const clearHoldOrdersDB = async () => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  await tx.objectStore(STORE).clear();
  await tx.done;
};

export const bulkUpsertHoldOrdersDB = async (orders) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  for (const order of orders) {
    await tx.store.put(order);
  }
  await tx.done;
};