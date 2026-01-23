import { openDB } from "idb";

const DB_NAME = "pos-orders-db";
const STORE = "orders";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: "localId" });
      store.createIndex("isSynced", "isSynced", { unique: false });
    }
  },
});

// CREATE ORDER (offline-safe)
export const saveOrderDB = async (order) => {
  const db = await dbPromise;
  await db.put(STORE, order);
};

// GET UNSYNCED ORDERS
export const getPendingOrdersDB = async () => {
  const db = await dbPromise;
 const allOrders = await db.getAll(STORE);

  // ✅ SAFE FILTER (NO INDEX = NO DataError)
  return allOrders.filter(o => o.isSynced === false);
};

// MARK ORDER AS SYNCED
export const markOrderSyncedDB = async (localId, serverId) => {
  const db = await dbPromise;
  const order = await db.get(STORE, localId);
  if (!order) return;

  order.isSynced = true;
  order.serverOrderId = serverId;

  await db.put(STORE, order);
};
