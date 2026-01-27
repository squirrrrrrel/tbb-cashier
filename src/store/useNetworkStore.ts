import { create } from "zustand";
import { useCustomerStore } from "./useCustomerStore";
import { useTableStore } from "./useTableStore";
import { usePaymentMethodStore } from "./usePaymentMethodStore";
import { useProductStore } from "./useProductStore";
import { syncPendingOrders } from "../utils/syncOrders";
import { fetchOrdersFromAPI } from "../utils/fetchOrdersFromAPI";
import { useOrderStore } from "./useOrderStore";

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
        // 🔼 PUSH: master data first
        await useCustomerStore.getState().syncCustomers();
        await useTableStore.getState().syncTables();

        // 🔼 PUSH: transactions
        await syncPendingOrders();
      } catch (err) {
        console.warn("⚠️ Push sync failed:", err);
      }

      try {
        // 🔽 PULL: master data
        await useCustomerStore.getState().fetchCustomersFromAPI();
        await useTableStore.getState().fetchTablesFromAPI();
        await usePaymentMethodStore.getState().fetchPaymentMethodsFromAPI();
        await useProductStore.getState().fetchProductsFromAPI();

        // 🔽 PULL: transactions
        await fetchOrdersFromAPI();

        // 🔁 reload UI from IndexedDB
        await useOrderStore.getState().loadOrdersFromDB();
      } catch (err) {
        console.warn("⚠️ Pull sync failed:", err);
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
