import { openDB } from "idb";

const DB_NAME = "pos-tables-db";
const STORE = "tables";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      db.createObjectStore(STORE, { keyPath: "localId" });
    }
  },
});

export const getTablesDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const addTableDB = async (table) => {
  const db = await dbPromise;
  await db.put(STORE, table);
};

export const updateTableDB = async (table) => {
  const db = await dbPromise;
  await db.put(STORE, table);
};

export const deleteTableDB = async (localId) => {
  const db = await dbPromise;
  await db.delete(STORE, localId);
}