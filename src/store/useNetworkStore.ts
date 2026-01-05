import { create } from "zustand";

export const useNetworkStore = create((set) => ({
  isOnline: navigator.onLine,
}));

window.addEventListener("online", () => {
  useNetworkStore.setState({ isOnline: true });
});

window.addEventListener("offline", () => {
  useNetworkStore.setState({ isOnline: false });
});
