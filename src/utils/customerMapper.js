import { v4 as uuidv4 } from "uuid";

export const mapCustomerToApiPayload = (customer) => ({
  first_name: customer.firstName,
  last_name: customer.lastName,
  outlet_id: customer.outlet_id,
  phone_code: customer.phoneCode,
  phone_number: customer.phone,
  email: customer.email,
  address_line_1: customer.address1,
  address_line_2: customer.address2,
  city: customer.city,
  state: customer.state,
  pincode: customer.pincode,
  country: customer.country,
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

// Map API response (snake_case) to local format (camelCase)
export const mapApiResponseToCustomer = (apiCustomer, existingLocalId = null) => {
  // Extract serverId from various possible fields (check in order of likelihood)
  const serverId = apiCustomer.id || apiCustomer.customer_id || apiCustomer.customerId || apiCustomer._id;

  return {
    serverId: serverId,
    // Use existing localId if provided, otherwise generate one based on serverId
    localId: existingLocalId || (serverId ? `server-${serverId}` : uuidv4()),
    firstName: apiCustomer.first_name || "",
    lastName: apiCustomer.last_name || "",
    phoneCode: apiCustomer.phone_code || "",
    phone: apiCustomer.phone_number || "",
    email: apiCustomer.email || "",
    address1: apiCustomer.address_line_1 || "",
    address2: apiCustomer.address_line_2 || "",
    city: apiCustomer.city || "",
    state: apiCustomer.state || "",
    outlet_id: apiCustomer.outlet_id || null,
    pincode: apiCustomer.pincode || "",
    country: apiCustomer.country || "",
    isSynced: true, // Data from server is always synced
    isDeleted: false,
    createdAt: dateToTimestamp(apiCustomer.created_at) || Date.now(),
    updatedAt: dateToTimestamp(apiCustomer.updated_at),
  };
};