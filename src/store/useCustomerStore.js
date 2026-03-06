import { create } from "zustand";
import {
  getCustomersDB,
  addCustomerDB,
  updateCustomerDB,
  deleteCustomerDB,
} from "../db/customersDB";
import api from "../utils/api";
import { mapCustomerToApiPayload, mapApiResponseToCustomer } from "../utils/customerMapper";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "./useAuthStore";


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

      // If online, also fetch from API to sync with server
      if (navigator.onLine) {
        try {
          const { fetchCustomersFromAPI } = get();
          await fetchCustomersFromAPI();
        } catch (err) {
          console.warn("⚠️ Failed to fetch customers from API during hydration:", err);
          // Don't block hydration if API fetch fails
        }
      }
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

    if (isDuplicate && !payload.isDeleted) {
      throw new Error("Customer with same email or phone already exists");
    }

    const customer = {
      ...payload,
      localId: uuidv4(), //local-only ID
      serverId: null,               // backend ID comes later
      isSynced: false,
      isDeleted: false,
      outlet_id: useAuthStore.getState().user?.outlet_id || null,
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
    // const { isDuplicateCustomer } = get();

    // const isDuplicate = await isDuplicateCustomer({
    //   email: payload.email,
    //   phone: payload.phone,
    // });

    // if (isDuplicate && !payload.isDeleted) {
    //   throw new Error("Customer with same email or phone already exists");
    // }
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
        const res = await api.delete(`/tenant/customer/${customer.serverId}`);
        // console.log("Delete response:", res.data);
        updatedCustomer.isSynced = true;
        await updateCustomerDB(updatedCustomer);
      } catch (err) {
        console.warn("⚠️ Online delete failed, will retry later");
      }
    }
  },



  // FETCH CUSTOMERS FROM API AND STORE IN INDEXEDDB
  fetchCustomersFromAPI: async () => {
    if (!navigator.onLine) {
      console.warn("⚠️ Cannot fetch customers: offline");
      return;
    }

    try {
      //  console.log("🔄 Fetching customers from API...");
      // Fetch customers from API
      const outletId = useAuthStore.getState().user?.outlet_id;
      const res = await api.get(`/tenant/customer/${outletId}`);
      // console.log("📦 API Response:", res.data);

      // Handle different possible response structures
      let apiCustomers = [];
      if (Array.isArray(res.data?.data)) {
        // Response: { data: [...] }
        apiCustomers = res.data.data;
      } else if (Array.isArray(res.data?.data?.customers)) {
        // Response: { data: { customers: [...] } }
        apiCustomers = res.data.data.customers;
      } else if (Array.isArray(res.data)) {
        // Response: [...]
        apiCustomers = res.data;
      } else {
        console.warn("⚠️ Invalid API response format:", res.data);
        return;
      }

      console.log(`📊 Received ${apiCustomers.length} customers from API`);

      // Get ALL existing customers from IndexedDB (including deleted for reference)
      const existingCustomers = await getCustomersDB();
      console.log(`💾 Found ${existingCustomers.length} existing customers in IndexedDB`);

      // Create maps for quick lookup
      const existingByServerId = new Map();
      const existingByLocalId = new Map();

      existingCustomers.forEach(c => {
        if (c.serverId) {
          existingByServerId.set(String(c.serverId), c);
        }
        existingByLocalId.set(c.localId, c);
      });

      // Track processed customers to avoid duplicates
      const processedLocalIds = new Set();
      const processedCustomers = [];

      // Process each customer from API
      for (const apiCustomer of apiCustomers) {
        // Extract serverId from various possible fields
        const serverId = apiCustomer.customer_id || apiCustomer.customerId || apiCustomer.id || apiCustomer._id;

        if (!serverId) {
          console.warn("⚠️ Customer from API missing ID:", apiCustomer);
          continue;
        }

        const serverIdStr = String(serverId);
        let existing = existingByServerId.get(serverIdStr);

        if (existing) {
          // Customer exists in IndexedDB - update with server data
          const mappedCustomer = mapApiResponseToCustomer(apiCustomer, existing.localId);

          // Preserve local unsaved changes if customer was recently edited locally
          if (!existing.isSynced && existing.updatedAt &&
            existing.updatedAt > (mappedCustomer.updatedAt || 0)) {
            // Keep existing customer with serverId updated
            const updated = {
              ...existing,
              serverId: mappedCustomer.serverId, // Ensure serverId is set
            };
            await updateCustomerDB(updated);
            processedCustomers.push(updated);
            processedLocalIds.add(updated.localId);
          } else {
            // Update with server data (server is source of truth)
            const mergedCustomer = {
              ...mappedCustomer,
              localId: existing.localId, // Preserve localId
            };
            await updateCustomerDB(mergedCustomer);
            processedCustomers.push(mergedCustomer);
            processedLocalIds.add(mergedCustomer.localId);
          }
        } else {
          // New customer from server - check if we have a local match by email/phone
          const mappedCustomer = mapApiResponseToCustomer(apiCustomer);
          let foundLocal = false;

          for (const existing of existingCustomers) {
            // Skip if already processed or deleted
            if (processedLocalIds.has(existing.localId) || existing.isDeleted) continue;

            // Match by email or phone if local customer doesn't have serverId
            if (!existing.serverId) {
              const emailMatch = existing.email && mappedCustomer.email &&
                existing.email.toLowerCase() === mappedCustomer.email.toLowerCase();
              const phoneMatch = existing.phone && mappedCustomer.phone &&
                existing.phone === mappedCustomer.phone;

              if (emailMatch || phoneMatch) {
                // Match found - merge local customer with server data
                const updatedCustomer = {
                  ...existing,
                  serverId: mappedCustomer.serverId,
                  isSynced: true,
                  // Use server data as source of truth
                  firstName: mappedCustomer.firstName,
                  lastName: mappedCustomer.lastName,
                  phoneCode: mappedCustomer.phoneCode,
                  phone: mappedCustomer.phone,
                  email: mappedCustomer.email,
                  address1: mappedCustomer.address1,
                  address2: mappedCustomer.address2,
                  city: mappedCustomer.city,
                  state: mappedCustomer.state,
                  pincode: mappedCustomer.pincode,
                  country: mappedCustomer.country,
                };
                await updateCustomerDB(updatedCustomer);
                processedCustomers.push(updatedCustomer);
                processedLocalIds.add(updatedCustomer.localId);
                foundLocal = true;
                break;
              }
            }
          }

          if (!foundLocal) {
            // Completely new customer from server
            await addCustomerDB(mappedCustomer);
            processedCustomers.push(mappedCustomer);
            processedLocalIds.add(mappedCustomer.localId);
          }
        }
      }

      // ... inside fetchCustomersFromAPI after the loop processing apiCustomers

      // 1. Create a set of all server IDs currently active on the server
      const serverActiveIds = new Set(apiCustomers.map(c =>
        String(c.customer_id || c.customerId || c.id || c._id)
      ));

      // 2. Identify customers to remove locally
      // Logic: If they have a serverId, but that ID is NOT in the server's active list
      for (const localCustomer of existingCustomers) {
        if (
          localCustomer.serverId &&
          !serverActiveIds.has(String(localCustomer.serverId)) &&
          localCustomer.isSynced // Only delete if we are sure it was already synced
        ) {
          console.log(`🗑️ Removing customer ${localCustomer.firstName} (Server ID: ${localCustomer.serverId}) because they were deleted on another device.`);
          await deleteCustomerDB(localCustomer.localId);
        }
      }

      // 3. Finally, refresh the Zustand state
      const finalCustomers = await getCustomersDB();
      set({
        customers: finalCustomers.filter(c => !c.isDeleted),
      });
      // Preserve ALL local-only customers (those without serverId that aren't deleted and not processed)
      // const localOnlyCustomers = existingCustomers.filter(
      //   c => !c.isDeleted &&
      //     !c.serverId &&
      //     !processedLocalIds.has(c.localId)
      // );

      // //console.log(`💾 Preserving ${localOnlyCustomers.length} local-only customers`);

      // // Combine server customers with local-only customers
      // const allCustomers = [...processedCustomers, ...localOnlyCustomers];

      // // Update Zustand state (only non-deleted customers)
      // const activeCustomers = allCustomers.filter(c => !c.isDeleted);
      // set({
      //   customers: activeCustomers,
      // });

      // console.log(`✅ Successfully synced ${processedCustomers.length} customers from API, preserved ${localOnlyCustomers.length} local customers. Total: ${activeCustomers.length} active customers`);
    } catch (err) {
      console.error("❌ Failed to fetch customers from API:", err);
      console.error("Error details:", err.response?.data || err.message);
      // Don't throw - allow app to continue with local data
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
          //  console.log("Sync create response:", res.data);
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
