import { openDB } from "idb";

const DB_NAME = "pos-db";
const STORE = "items";

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "id" });
    }
  },
});

export const getItemsDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const addItemDB = async (item) => {
  const db = await dbPromise;
  await db.put(STORE, item);
};
