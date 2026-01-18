import { create } from "zustand";
import { useCustomerStore } from "./useCustomerStore";

export const useNetworkStore = create((set, get) => ({
  online: navigator.onLine,

  init: () => {
    // 🔹 CASE 1: App loads and internet is already ON
    if (navigator.onLine) {
      useCustomerStore.getState().syncCustomers();
    }

    const handleOnline = () => {
      set({ online: true });
      console.log("Network online");
      // 🔁 trigger sync safely
      useCustomerStore.getState().syncCustomers();
    };

    const handleOffline = () => {
      console.log("Network offline");
      
      set({ online: false });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  },
}));
