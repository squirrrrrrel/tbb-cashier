import { openDB } from "idb";

const DB_NAME = "pos-categories-db";
const STORE = "categories";

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "id" });
    }
  },
});

/* ========= READ ========= */

export const getCategoriesDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

/* ========= UPSERT ========= */

export const bulkUpsertCategoriesDB = async (categories) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  for (const c of categories) {
    await store.put(c); // put = insert OR update
  }

  await tx.done;
};
