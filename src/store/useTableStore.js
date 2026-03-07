import { create } from "zustand";
import { getTablesDB, addTableDB, updateTableDB, deleteTableDB } from "../db/tabelDB"; // Ensure deleteTableDB is imported
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

      if (navigator.onLine) {
        try {
          const { fetchTablesFromAPI } = get();
          await fetchTablesFromAPI();
        } catch (err) {
          console.warn("⚠️ Failed to fetch tables from API during hydration:", err);
        }
      }
    } catch {
      set({ hydrated: true });
    }
  },

  // 🔹 ADD TABLE (OFFLINE-FIRST)
  addTable: async ({ tableNumber, seats }) => {
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) throw new Error("Outlet ID is required");

    const table = {
      localId: uuidv4(),
      serverId: null,
      tableNumber,
      outletId,
      seats,
      isSynced: false,
      isDeleted: false,
      createdAt: Date.now(),
    };

    await addTableDB(table);
    await get().hydrate();

    if (!navigator.onLine) return;

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

    await updateTableDB(updatedTable);

    const outletId = useAuthStore.getState().user?.outlet_id;
    set((s) => ({
      tables: s.tables.filter(t => t.localId !== localId),
    }));

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

  // 🔹 FETCH TABLES FROM API AND STORE IN INDEXEDDB (ADJUSTED LOGIC)
  fetchTablesFromAPI: async () => {
    if (!navigator.onLine) return;

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) return;

    try {
      const res = await api.get(`/outlet/table?outlet_id=${outletId}`);

      let apiTables = [];
      if (Array.isArray(res.data?.data)) apiTables = res.data.data;
      else if (Array.isArray(res.data?.data?.tables)) apiTables = res.data.data.tables;
      else if (Array.isArray(res.data)) apiTables = res.data;
      else return;

      const existingTables = await getTablesDB();
      const outletTables = existingTables.filter(t => t.outletId === outletId);

      const existingByServerId = new Map();
      outletTables.forEach(t => {
        if (t.serverId) existingByServerId.set(String(t.serverId), t);
      });

      const processedLocalIds = new Set();
      const processedTables = [];

      // Process each table from API
      for (const apiTable of apiTables) {
        const serverId = apiTable.id || apiTable.table_id || apiTable.tableId || apiTable._id;
        if (!serverId) continue;

        const serverIdStr = String(serverId);
        let existing = existingByServerId.get(serverIdStr);

        if (existing) {
          const mappedTable = mapApiResponseToTable(apiTable, existing.localId, outletId);
          if (!existing.isSynced && existing.updatedAt && existing.updatedAt > (mappedTable.updatedAt || 0)) {
            const updated = { ...existing, serverId: mappedTable.serverId };
            await updateTableDB(updated);
            processedTables.push(updated);
            processedLocalIds.add(updated.localId);
          } else {
            const mergedTable = { ...mappedTable, localId: existing.localId };
            await updateTableDB(mergedTable);
            processedTables.push(mergedTable);
            processedLocalIds.add(mergedTable.localId);
          }
        } else {
          const mappedTable = mapApiResponseToTable(apiTable, null, outletId);
          await addTableDB(mappedTable);
          processedTables.push(mappedTable);
          processedLocalIds.add(mappedTable.localId);
        }
      }

      // 🛑 GHOST CLEANUP LOGIC (Applied from Customer Store Reference)
      const serverActiveIds = new Set(apiTables.map(t =>
        String(t.id || t.table_id || t.tableId || t._id)
      ));

      for (const localTable of outletTables) {
        if (
          localTable.serverId &&
          !serverActiveIds.has(String(localTable.serverId)) &&
          localTable.isSynced // Only remove if it was successfully uploaded previously
        ) {
          console.log(`🗑️ Removing table ${localTable.tableNumber} because it was deleted on the server.`);
          await deleteTableDB(localTable.localId);
        }
      }

      // Refresh final list from DB to ensure IndexedDB and Zustand are perfectly in sync
      const finalTables = await getTablesDB();
      set({
        tables: finalTables.filter(t => t.outletId === outletId && !t.isDeleted),
      });

    } catch (err) {
      console.error("❌ Failed to fetch tables from API:", err);
    }
  },

  // 🔹 SYNC WHEN ONLINE
  syncTables: async () => {
    if (!navigator.onLine) return;
    const outletId = useAuthStore.getState().user?.outlet_id;
    if (!outletId) return;

    const tables = await getTablesDB();
    const outletTables = tables.filter(t => t.outletId === outletId);

    // Sync Deleted
    const deletedTables = outletTables.filter(t => t.isDeleted && t.serverId && !t.isSynced);
    for (const table of deletedTables) {
      try {
        await api.delete(`/outlet/table/${table.serverId}?outlet_id=${outletId}`);
        table.isSynced = true;
        await updateTableDB(table);
      } catch (err) { console.warn(err); }
    }

    // Sync New
    const newTables = outletTables.filter(t => !t.isDeleted && !t.serverId && !t.isSynced);
    for (const table of newTables) {
      try {
        const res = await api.post(`/outlet/table?outlet_id=${outletId}`, mapTableToApiPayload(table));
        const serverTable = res.data?.data || res.data;
        table.serverId = serverTable.id || serverTable.table_id || serverTable._id;
        table.isSynced = true;
        await updateTableDB(table);
      } catch (err) { console.warn(err); }
    }

    await get().hydrate();
  },
}));