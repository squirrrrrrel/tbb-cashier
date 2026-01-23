import { create } from "zustand";
import { getPaymentMethodsDB, savePaymentMethodsDB } from "../db/paymentMethodsDB";
import api from "../utils/api";

export const usePaymentMethodStore = create((set, get) => ({
  paymentMethods: [],
  hydrated: false,

  // 🔹 LOAD FROM INDEXEDDB
  hydrate: async () => {
    try {
      const paymentMethods = await getPaymentMethodsDB();
      set({
        paymentMethods,
        hydrated: true,
      });
      
      // If online, also fetch from API to sync with server
      if (navigator.onLine) {
        try {
          const { fetchPaymentMethodsFromAPI } = get();
          await fetchPaymentMethodsFromAPI();
        } catch (err) {
          console.warn("⚠️ Failed to fetch payment methods from API during hydration:", err);
          // Don't block hydration if API fetch fails
        }
      }
    } catch {
      set({ hydrated: true });
    }
  },

  // 🔹 FETCH PAYMENT METHODS FROM API AND STORE IN INDEXEDDB
  fetchPaymentMethodsFromAPI: async () => {
    if (!navigator.onLine) {
      console.warn("⚠️ Cannot fetch payment methods: offline");
      return;
    }

    try {
      console.log("🔄 Fetching payment methods from API...");
      // Fetch payment methods from API
      const res = await api.get("/tenant_payment_methods");
      console.log("📦 API Response:", res.data);
      
      // Handle different possible response structures
      let apiPaymentMethods = [];
      if (Array.isArray(res.data?.data)) {
        // Response: { data: [...] }
        apiPaymentMethods = res.data.data;
      } else if (Array.isArray(res.data)) {
        // Response: [...]
        apiPaymentMethods = res.data;
      } else {
        console.warn("⚠️ Invalid API response format:", res.data);
        return;
      }
      
      console.log(`📊 Received ${apiPaymentMethods.length} payment methods from API`);

      // Map API response to local format
      const mappedPaymentMethods = apiPaymentMethods.map(pm => ({
        id: pm.id,
        payment_method_name: pm.payment_method_name || pm.paymentMethodName || "",
        display_name: pm.display_name || pm.displayName || pm.payment_method_name || "",
      }));

      // Store in IndexedDB
      await savePaymentMethodsDB(mappedPaymentMethods);
      
      // Update Zustand state
      set({
        paymentMethods: mappedPaymentMethods,
      });

      console.log(`✅ Successfully synced ${mappedPaymentMethods.length} payment methods from API`);
    } catch (err) {
      console.error("❌ Failed to fetch payment methods from API:", err);
      console.error("Error details:", err.response?.data || err.message);
      // Don't throw - allow app to continue with local data
    }
  },
}));
