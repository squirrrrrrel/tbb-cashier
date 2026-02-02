import { v4 as uuidv4 } from "uuid";
// Map table to API payload format
export const mapTableToApiPayload = (table) => ({
  table_number: String(table.tableNumber || ""),
  capacity: Number(table.seats || table.capacity || 0),
});

// Helper function to convert date to timestamp
const dateToTimestamp = (dateValue) => {
  if (!dateValue) return null;
  if (typeof dateValue === 'number') return dateValue;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.getTime();
  } catch {
    return null;
  }
};

// Map API response to local table format
export const mapApiResponseToTable = (apiTable, existingLocalId = null, outletId = null) => {
  // Extract serverId from various possible fields
  const serverId = apiTable.id || apiTable.table_id || apiTable.tableId || apiTable._id;

  return {
    serverId: serverId,
    // Use existing localId if provided, otherwise generate one based on serverId
    localId: existingLocalId || (serverId ? `server-${serverId}` : uuidv4()),
    tableNumber: apiTable.table_number || apiTable.tableNumber || 0,
    // Map capacity from API to seats in local format
    seats: apiTable.capacity || apiTable.seats || 0,
    outletId: outletId || apiTable.outlet_id || apiTable.outletId || null,
    occupied: apiTable.status === 'occupied' || apiTable.occupied || false,
    isSynced: true, // Data from server is always synced
    isDeleted: false,
    createdAt: dateToTimestamp(apiTable.created_at) || Date.now(),
    updatedAt: dateToTimestamp(apiTable.updated_at),
  };
};
