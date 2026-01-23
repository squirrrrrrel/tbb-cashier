import { openDB } from "idb";

const DB_NAME = "pos-payment-methods-db";
const STORE = "paymentMethods";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "id" });
    }
  },
});

export const getPaymentMethodsDB = async () => {
  const db = await dbPromise;
  return db.getAll(STORE);
};

export const savePaymentMethodDB = async (paymentMethod) => {
  const db = await dbPromise;
  await db.put(STORE, paymentMethod);
};

export const savePaymentMethodsDB = async (paymentMethods) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE, "readwrite");
  await Promise.all([
    ...paymentMethods.map(pm => tx.store.put(pm)),
    tx.done,
  ]);
};
