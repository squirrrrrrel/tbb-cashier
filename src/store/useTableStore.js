import { create } from "zustand";
import { getTablesDB, addTableDB, updateTableDB } from "../db/tabelDB";
import api from "../utils/api";
import { useAuthStore } from "./useAuthStore";
import { mapTableToApiPayload, mapApiResponseToTable } from "../utils/tableMapper";
import { v4 as uuidv4 } from "uuid";

export const useTableStore = create((set, get) => ({
  tables: [],
  hydrated: false,

  // 🔹 LOAD FROM INDEXEDDB
  hydrate: async () => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      set({ hydrated: true });
      return;
    }

    try {
      const tables = await getTablesDB();

      set({
        tables: tables.filter(
          t => t.outletId === outletId && !t.isDeleted
        ),
        hydrated: true,
      });

      // If online, also fetch from API to sync with server
      if (navigator.onLine) {
        try {
          const { fetchTablesFromAPI } = get();
          await fetchTablesFromAPI();
        } catch (err) {
          console.warn("⚠️ Failed to fetch tables from API during hydration:", err);
          // Don't block hydration if API fetch fails
        }
      }
    } catch {
      set({ hydrated: true });
    }
  },

  // 🔹 ADD TABLE (OFFLINE-FIRST)
  addTable: async ({ tableNumber, seats }) => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      throw new Error("Outlet ID is required");
    }

    const table = {
      localId: uuidv4(), // local ID
      serverId: null,               // backend ID later
      tableNumber,
      outletId,
      seats,
      isSynced: false,
      isDeleted: false,
      createdAt: Date.now(),
    };

    // 1️⃣ Save locally
    await addTableDB(table);
    await get().hydrate();

    if (!navigator.onLine) return;

    // 2️⃣ Sync with server
    try {
      const res = await api.post(`/outlet/table?outlet_id=${outletId}`,
        mapTableToApiPayload(table),
        { headers: { "Content-Type": "application/json" } }
      );
      const serverTable = res.data?.data || res.data;
      table.serverId = serverTable.id || serverTable.table_id || serverTable._id;
      table.isSynced = true;
      await updateTableDB(table);
      await get().hydrate();
    } catch (err) {
      console.warn("⚠️ Table add sync failed, will retry later:", err);
    }
  },

  // 🔹 DELETE TABLE
  deleteTable: async (localId) => {
    const table = get().tables.find(t => t.localId === localId);
    if (!table) return;

    const updatedTable = {
      ...table,
      isDeleted: true,
      isSynced: false,
      deletedAt: Date.now(),
    };

    // Update IndexedDB
    await updateTableDB(updatedTable);

    // Remove from UI immediately
    const outletId = useAuthStore.getState().user?.outlet_id;
    set((s) => ({
      tables: s.tables.filter(t => t.localId !== localId),
    }));

    // Sync delete if online
    if (navigator.onLine && table.serverId) {
      try {
        await api.delete(`/outlet/table/${table.serverId}?outlet_id=${outletId}`);
        updatedTable.isSynced = true;
        await updateTableDB(updatedTable);
      } catch (err) {
        console.warn("⚠️ Online delete failed, will retry later:", err);
      }
    }
  },

  // 🔹 FETCH TABLES FROM API AND STORE IN INDEXEDDB
  fetchTablesFromAPI: async () => {
    if (!navigator.onLine) {
      console.warn("⚠️ Cannot fetch tables: offline");
      return;
    }

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) {
      console.warn("⚠️ Cannot fetch tables: no outlet ID");
      return;
    }

    try {
     // console.log("🔄 Fetching tables from API...");
      // Fetch tables from API
      const res = await api.get(`/outlet/table?outlet_id=${outletId}`);
     // console.log("📦 API Response:", res.data);

      // Handle different possible response structures
      let apiTables = [];
      if (Array.isArray(res.data?.data)) {
        // Response: { data: [...] }
        apiTables = res.data.data;
      } else if (Array.isArray(res.data?.data?.tables)) {
        // Response: { data: { tables: [...] } }
        apiTables = res.data.data.tables;
      } else if (Array.isArray(res.data)) {
        // Response: [...]
        apiTables = res.data;
      } else {
        console.warn("⚠️ Invalid API response format:", res.data);
        return;
      }

    //  console.log(`📊 Received ${apiTables.length} tables from API`);

      // Get ALL existing tables from IndexedDB
      const existingTables = await getTablesDB();
    //  console.log(`💾 Found ${existingTables.length} existing tables in IndexedDB`);

      // Filter existing tables by outletId
      const outletTables = existingTables.filter(t => t.outletId === outletId);

      // Create maps for quick lookup
      const existingByServerId = new Map();
      const existingByLocalId = new Map();

      outletTables.forEach(t => {
        if (t.serverId) {
          existingByServerId.set(String(t.serverId), t);
        }
        existingByLocalId.set(t.localId, t);
      });

      // Track processed tables to avoid duplicates
      const processedLocalIds = new Set();
      const processedTables = [];

      // Process each table from API
      for (const apiTable of apiTables) {
        // Extract serverId from various possible fields
        const serverId = apiTable.id || apiTable.table_id || apiTable.tableId || apiTable._id;

        if (!serverId) {
          console.warn("⚠️ Table from API missing ID:", apiTable);
          continue;
        }

        const serverIdStr = String(serverId);
        let existing = existingByServerId.get(serverIdStr);

        if (existing) {
          // Table exists in IndexedDB - update with server data
          const mappedTable = mapApiResponseToTable(apiTable, existing.localId, outletId);

          // Preserve local unsaved changes if table was recently edited locally
          if (!existing.isSynced && existing.updatedAt &&
            existing.updatedAt > (mappedTable.updatedAt || 0)) {
            // Keep existing table with serverId updated
            const updated = {
              ...existing,
              serverId: mappedTable.serverId, // Ensure serverId is set
            };
            await updateTableDB(updated);
            processedTables.push(updated);
            processedLocalIds.add(updated.localId);
          } else {
            // Update with server data (server is source of truth)
            const mergedTable = {
              ...mappedTable,
              localId: existing.localId, // Preserve localId
            };
            await updateTableDB(mergedTable);
            processedTables.push(mergedTable);
            processedLocalIds.add(mergedTable.localId);
          }
        } else {
          // New table from server
          const mappedTable = mapApiResponseToTable(apiTable, null, outletId);
          await addTableDB(mappedTable);
          processedTables.push(mappedTable);
          processedLocalIds.add(mappedTable.localId);
        }
      }

      // Preserve ALL local-only tables (those without serverId that aren't deleted and not processed)
      const localOnlyTables = outletTables.filter(
        t => !t.isDeleted &&
          !t.serverId &&
          !processedLocalIds.has(t.localId)
      );

     // console.log(`💾 Preserving ${localOnlyTables.length} local-only tables`);

      // Combine server tables with local-only tables
      const allTables = [...processedTables, ...localOnlyTables];

      // Update Zustand state (only non-deleted tables for current outlet)
      const activeTables = allTables.filter(t => !t.isDeleted && t.outletId === outletId);
      set({
        tables: activeTables,
      });

    //  console.log(`✅ Successfully synced ${processedTables.length} tables from API, preserved ${localOnlyTables.length} local tables. Total: ${activeTables.length} active tables`);
    } catch (err) {
      console.error("❌ Failed to fetch tables from API:", err);
      console.error("Error details:", err.response?.data || err.message);
      // Don't throw - allow app to continue with local data
    }
  },

  // 🔹 SYNC WHEN ONLINE
  syncTables: async () => {
    if (!navigator.onLine) return;

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) return;

    const tables = await getTablesDB();
    const outletTables = tables.filter(t => t.outletId === outletId);

    // 🔥 1️⃣ SYNC DELETED TABLES
    const deletedTables = outletTables.filter(
      t => t.isDeleted && t.serverId && !t.isSynced
    );

    for (const table of deletedTables) {
      try {
        await api.delete(
          `/outlet/table/${table.serverId}?outlet_id=${outletId}`
        );
        table.isSynced = true;
        await updateTableDB(table);
      } catch (err) {
        console.warn("⚠️ Table delete sync failed:", err);
      }
    }

    // 🔥 2️⃣ SYNC NEW TABLES
    const newTables = outletTables.filter(
      t => !t.isDeleted && !t.serverId && !t.isSynced
    );

    for (const table of newTables) {
      try {
        const res = await api.post(
          `/outlet/table?outlet_id=${outletId}`,
          mapTableToApiPayload(table),
          { headers: { "Content-Type": "application/json" } }
        );

        const serverTable = res.data?.data || res.data;
        table.serverId =
          serverTable.id || serverTable.table_id || serverTable._id;
        table.isSynced = true;

        await updateTableDB(table);
      } catch (err) {
        console.warn("⚠️ Table create sync failed:", err);
      }
    }

    await get().hydrate();
  },

}));
