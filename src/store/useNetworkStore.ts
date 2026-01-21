import { create } from "zustand";
import { useCustomerStore } from "./useCustomerStore";
import { useTableStore } from "./useTableStore";

let initialized = false;

export const useNetworkStore = create((set) => ({
  online: navigator.onLine,

  init: () => {
    if (initialized) return; // 🛑 prevent double init
    initialized = true;

    const handleOnline = () => {
      set({ online: true });
      console.log("🌐 Network online");

      // PUSH → THEN PULL
      useCustomerStore.getState().syncCustomers();
      useTableStore.getState().syncTables();

      useCustomerStore.getState().fetchCustomersFromAPI();
      useTableStore.getState().fetchTablesFromAPI();
    };

    const handleOffline = () => {
      console.log("📴 Network offline");
      set({ online: false });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  },
}));

