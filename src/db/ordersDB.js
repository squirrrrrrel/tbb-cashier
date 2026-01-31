import { openDB } from "idb";

const DB_NAME = "pos-orders-db";
const STORE = "orders";

const dbPromise = openDB(DB_NAME, 3, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: "localId" });
      store.createIndex("isSynced", "isSynced", { unique: false });
       store.createIndex("serverOrderId", "serverOrderId", { unique: false });
      // store.createIndex("status", "status");
      // store.createIndex("createdAt", "createdAt");
    }
  },
});

// CREATE ORDER (offline-safe)
export const saveOrderDB = async (order) => {
  const db = await dbPromise;
  await db.put(STORE, order);
};
// GET ALL ORDERS
export const getAllOrdersDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};
// GET UNSYNCED ORDERS
export const getPendingOrdersDB = async () => {
  const db = await dbPromise;
 const allOrders = await db.getAll(STORE);
  // ✅ SAFE FILTER (NO INDEX = NO DataError)
  return allOrders.filter(o => o.isSynced === false);
};

// MARK ORDER AS SYNCED
export const markOrderSyncedDB = async (localId, serverOrderId) => {
  const db = await dbPromise;
  const order = await db.get(STORE, localId);
  if (!order) return;

  order.isSynced = true;
  order.serverOrderId = serverOrderId;

  await db.put(STORE, order);
};
// DELETE ORDER
// DELETE local-only orders if a server order already exists
export const deleteLocalUnsyncedOrdersDB = async () => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  // ✅ CORRECT way to read all records
  const allOrders = await store.getAll();
  console.log("🧪 Before cleanup:", allOrders.map(o => o.localId));

  for (const order of allOrders) {
    // ❌ delete everything that is NOT server-backed
    if (!order.localId?.startsWith("server-")) {
      console.log("🗑️ Deleting:", order.localId);
      await store.delete(order.localId);
    }
  }

  await tx.done;

  const remaining = await db.getAll(STORE);
  console.log("✅ After cleanup:", remaining.map(o => o.localId));
};



