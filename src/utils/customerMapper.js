export const mapCustomerToApiPayload = (customer) => ({
  first_name: customer.firstName,
  last_name: customer.lastName,
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
