import { openDB } from "idb";

const DB_NAME = "pos-promotions-db";
const STORE = "promotions";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "localId" });
    }
  },
});

export const getPromotionsDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const addPromotionDB = async (promotion) => {
  const db = await dbPromise;
  await db.put(STORE, promotion);
};

export const updatePromotionDB = async (promotion) => {
  const db = await dbPromise;
  await db.put(STORE, promotion);
};

export const deletePromotionDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
};
