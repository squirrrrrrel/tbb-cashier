import { openDB } from "idb";

const DB_NAME = "pos-customers-db";
const STORE = "customers";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    // 🔴 MIGRATION SAFE GUARD
    if (oldVersion < 2) {
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      db.createObjectStore(STORE, { keyPath: "localId" });
    }
  },
});

export const getCustomersDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const addCustomerDB = async (customer) => {
  const db = await dbPromise;
  await db.put(STORE, customer);
};

export const updateCustomerDB = async (customer) => {
  const db = await dbPromise;
  await db.put(STORE, customer);
};

export const deleteCustomerDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
};
