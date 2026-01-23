import { create } from "zustand";
import { useCustomerStore } from "./useCustomerStore";
import { useTableStore } from "./useTableStore";
import { usePaymentMethodStore } from "./usePaymentMethodStore";
import { useLowStockStore } from "./useLowStockStore";
import { syncPendingOrders } from "../utils/syncOrders";
import { useProductStore } from "./useProductStore";

let initialized = false;

export const useNetworkStore = create((set) => ({
  online: navigator.onLine,

  init: () => {
    if (initialized) return;
    initialized = true;

    const handleOnline = async () => {
      console.log("🌐 Network online");
      set({ online: true });

      try {

        await syncPendingOrders();
        await useProductStore.getState().fetchProductsFromAPI();

        // 🔼 PUSH local → server
        await useCustomerStore.getState().syncCustomers();
        await useTableStore.getState().syncTables();
      } catch (err) {
        console.warn("⚠️ Sync failed:", err);
      }

      try {
        // 🔽 PULL server → local
        await useCustomerStore.getState().fetchCustomersFromAPI();
        await useTableStore.getState().fetchTablesFromAPI();
        await usePaymentMethodStore.getState().fetchPaymentMethodsFromAPI();
        await useProductStore.getState().fetchProductsFromAPI();
        //await useLowStockStore.getState().fetchLowStockFromAPI();
      } catch (err) {
        console.warn("⚠️ Fetch failed:", err);
      }
    };

    const handleOffline = () => {
      console.log("📴 Network offline");
      set({ online: false });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    console.log("🌍 Network listeners initialized");
  },
}));
