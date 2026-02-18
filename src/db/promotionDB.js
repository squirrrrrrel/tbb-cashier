import { openDB } from "idb";

const DB_NAME = "pos-promotions-db";
const STORE = "promotions";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      db.createObjectStore(STORE, { keyPath: "serverId"});
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
