import { openDB } from "idb";

const DB_NAME = "pos-credit-order-db";
const STORE = "credit_orders";

export const dbPromise = openDB(DB_NAME, 2, { 
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: "orderId" });
        }
    },
});

export const getCreditOrdersDB = async () => {
    const db = await dbPromise;
    return db.getAll(STORE);
};

export const bulkUpsertCreditOrdersDB = async (orders) => {
    console.log("Attempting to save to DB:", orders); // 🔍 Add this
    const db = await dbPromise;
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    for (const o of orders) {
        // If o.orderId is undefined, this line fails
        await store.put(o); 
    }
    await tx.done;
    console.log("DB Save Complete");
};

export const clearCreditOrdersDB = async () => {
    const db = await dbPromise;
    const tx = db.transaction(STORE, "readwrite");
    await tx.objectStore(STORE).clear();
    await tx.done;
};