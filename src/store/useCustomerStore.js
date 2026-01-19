import { create } from "zustand";
import {
  getCustomersDB,
  addCustomerDB,
  updateCustomerDB,
  deleteCustomerDB,
} from "../db/customersDB";
import api from "../utils/api";
import { mapCustomerToApiPayload } from "../utils/customerMapper";

export const useCustomerStore = create((set, get) => ({
  customers: [],
  hydrated: false,

// LOAD FROM INDEXEDDB
hydrate: async () => {
  try {
    const customers = await getCustomersDB();
    set({
      customers: customers.filter(c => !c.isDeleted),
      hydrated: true,
    });
  } catch {
    set({ hydrated: true });
  }
},


isDuplicateCustomer: async ({
  email,
  phone,
  excludeLocalId = null,
}) => {
  const customers = await getCustomersDB();

  return customers.some((c) => {
    if (c.isDeleted) return false;
    if (excludeLocalId && c.localId === excludeLocalId) return false;

    return (
      (email && c.email === email) ||
      (phone && c.phone === phone)
    );
  });
},


// ADD CUSTOMER (OFFLINE-FIRST)
 addCustomer: async (payload) => {
const { isDuplicateCustomer } = get();
  
  const isDuplicate = await isDuplicateCustomer({
    email: payload.email,
    phone: payload.phone,
  });

  if (isDuplicate) {
    throw new Error("Customer with same email or phone already exists");
  }
  
  const customer = {
    ...payload,
    localId: crypto.randomUUID(), //local-only ID
    serverId: null,               // backend ID comes later
    isSynced: false,
    isDeleted: false,
    createdAt: Date.now(),
  };

  //Save locally FIRST
  await addCustomerDB(customer);
  set((s) => ({ customers: [...s.customers, customer] }));

  //If online → sync immediately
  if (navigator.onLine) {
    try {
      const res = await api.post(
        "/tenant/customer",
        mapCustomerToApiPayload(customer),
        { headers: { "Content-Type": "application/json" } }
      );

      //backend must return created customer
      const serverCustomer = res.data.data.customer || res.data;
      const updatedCustomer = {
        ...customer,
        serverId: serverCustomer.customerId || serverCustomer._id,
        isSynced: true,
      };

      // 3️⃣ Update IndexedDB
      await updateCustomerDB(updatedCustomer);

      // 4️⃣ Update Zustand state
      set((s) => ({
        customers: s.customers.map((c) =>
          c.localId === customer.localId ? updatedCustomer : c
        ),
      }));
    } catch (err) {
      console.warn("⚠️ Online sync failed, will retry later");
    }
  }
},

// edit customer
editCustomer: async (payload) => {
  const updatedCustomer = {
    ...payload,
    isSynced: false,
    updatedAt: Date.now(),
  };

  // Update IndexedDB
  await updateCustomerDB(updatedCustomer);

  // Update UI
  set((s) => ({
    customers: s.customers.map((c) =>
      c.localId === updatedCustomer.localId ? updatedCustomer : c
    ),
  }));

  // If online → sync immediately
  if (navigator.onLine && updatedCustomer.serverId) {
    try {
      await api.put(
        `/tenant/customer/${updatedCustomer.serverId}`,
        mapCustomerToApiPayload(updatedCustomer),
        { headers: { "Content-Type": "application/json" } }
      );

      updatedCustomer.isSynced = true;
      await updateCustomerDB(updatedCustomer);

      set((s) => ({
        customers: s.customers.map((c) =>
          c.localId === updatedCustomer.localId ? updatedCustomer : c
        ),
      }));
    } catch {
      console.warn("⚠️ Online edit sync failed, will retry later");
    }
  }
},


// delete customer
deleteCustomer: async (localId) => {
  const customer = get().customers.find(c => c.localId === localId);
  if (!customer) return;

  const updatedCustomer = {
    ...customer,
    isDeleted: true,
    isSynced: false,
    deletedAt: Date.now(),
  };

  //MUST overwrite same localId record
  await updateCustomerDB(updatedCustomer);

  // Remove from UI immediately
  set((s) => ({
    customers: s.customers.filter(c => c.localId !== localId),
  }));

  //Sync delete if online
  if (navigator.onLine && customer.serverId) {
    try {
     const res =  await api.delete(`/tenant/customer/${customer.serverId}`);
     console.log("Delete response:", res.data);
      updatedCustomer.isSynced = true;
      await updateCustomerDB(updatedCustomer);
    } catch (err) {
      console.warn("⚠️ Online delete failed, will retry later");
    }
  }
},



 // SYNC WHEN ONLINE
syncCustomers: async () => {
  if (!navigator.onLine) return;

  // 🔴 READ FROM INDEXEDDB (NOT ZUSTAND)
  const customers = await getCustomersDB();

  // 🔴 DELETE FIRST
  const toDelete = customers.filter(
    c => c.isDeleted && !c.isSynced && c.serverId
  );

  for (const customer of toDelete) {
    try {
      await api.delete(`/tenant/customer/${customer.serverId}`);
      customer.isSynced = true;
      await updateCustomerDB(customer);
    } catch {
      return;
    }
  }

  // 🟢 CREATE / UPDATE
  const toUpsert = customers.filter(
    c => !c.isDeleted && !c.isSynced
  );

  for (const customer of toUpsert) {
    try {
      if (customer.serverId) {
        await api.put(
          `/tenant/customer/${customer.serverId}`,
          mapCustomerToApiPayload(customer)
        );
      } else {
        const res = await api.post(
          "/tenant/customer",
          mapCustomerToApiPayload(customer)
        );
console.log("Sync create response:", res.data);
        customer.serverId = res.data.data.customer.customerId || res.data.customer.customerId || res.data._id;
      }

      customer.isSynced = true;
      await updateCustomerDB(customer);
    } catch {
      return;
    }
  }

  // 🔄 Refresh UI from DB
  set({
    customers: customers.filter(c => !c.isDeleted),
  });
},

}));
