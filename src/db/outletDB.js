import { openDB } from "idb";

const DB_NAME = "pos-outlet-db";
const STORE = "outlet";

export const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: "id" });
        }
    },
});

/* ========= READ ========= */

export const getOutletDB = async () => {
    const db = await dbPromise;
    return db.getAll(STORE);
};

/* ========= UPSERT ========= */

export const bulkUpsertOutletDB = async (outlets) => {
    const db = await dbPromise;
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    for (const o of outlets) {
        await store.put(o); // put = insert OR update
    }

    await tx.done;
};
