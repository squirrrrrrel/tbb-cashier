import { create } from "zustand";
import api from "../utils/api";
import { getCreditOrdersDB, bulkUpsertCreditOrdersDB, clearCreditOrdersDB } from "../db/creditOrderDB";

export const useCreditOrderStore = create((set, get) => ({
    creditOrders: [],
    hydrated: false,
    loading: false,

    /* ================= HYDRATE ================= */
    // This loads data from IndexedDB when the app starts
    hydrate: async () => {
        try {
            const localData = await getCreditOrdersDB();
            set({ creditOrders: localData, hydrated: true });
        } catch (err) {
            console.error("Credit Order hydration failed:", err);
        }
    },

    /* ================= FETCH ================= */
    fetchCreditOrders: async (outletId, paymentMethodId) => {
        if (!navigator.onLine || !outletId || !paymentMethodId) return;

        set({ loading: true });
        try {
            const url = `/outlet/order/invoices-on-credit/${outletId}/${paymentMethodId}`;
            const res = await api.get(url);

            const apiData = res?.data?.data || res?.data || [];
            await clearCreditOrdersDB();

            await bulkUpsertCreditOrdersDB(apiData);

            set({ creditOrders: apiData, loading: false });
        } catch (err) {
            console.error("Failed to fetch credit orders:", err);
            set({ loading: false });
        }
    },
}));