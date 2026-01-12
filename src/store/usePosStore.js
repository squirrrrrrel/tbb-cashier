import { create } from "zustand";
import { getItemsDB, addItemDB } from "../utils/indexedDB";

export const usePosStore = create((set) => ({
  items: [],
  category: "ALL",
  hydrated: false,

  hydrate: async () => {
    try {
      const items = await getItemsDB();
      set({ items, hydrated: true });
    } catch (error) {
      console.error("POS hydrate failed", error);
      set({ hydrated: true }); // 🔴 never block UI forever
    }
  },

  addItem: async (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    await addItemDB(newItem);
    const items = await getItemsDB();
    set({ items });
  },

  setCategory: (category) => set({ category }),
}));
