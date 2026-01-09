// store/useNetworkStore.js
import { create } from "zustand";

export const useNetworkStore = create((set) => ({
  online: navigator.onLine,

  init: () => {
    window.addEventListener("online", () => set({ online: true }));
    window.addEventListener("offline", () => set({ online: false }));
  },
}));
