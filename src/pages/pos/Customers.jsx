import React, { useEffect, useState } from "react";
import AddCustomersForm from "../../components/pos/customers/AddCustomersForm";
import CustomerList from "../../components/pos/customers/CustomerList";
import OfflineLoader from "../../components/OfflineLoader";
import { useCustomerStore } from "../../store/useCustomerStore";

const Customers = () => {
  const {
    customers,
    hydrate,
    hydrated,
    addCustomer,
    editCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  
  const countriesList = [
    { name: "India", code: "+91" },
    { name: "United States", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "Canada", code: "+1" },
    { name: "Australia", code: "+61" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Italy", code: "+39" },
    { name: "Spain", code: "+34" },
    { name: "Netherlands", code: "+31" },
    { name: "Brazil", code: "+55" },
    { name: "Mexico", code: "+52" },
    { name: "Russia", code: "+7" },
    { name: "China", code: "+86" },
    { name: "Japan", code: "+81" },
    { name: "South Korea", code: "+82" },
    { name: "South Africa", code: "+27" },
    { name: "New Zealand", code: "+64" },
    { name: "Singapore", code: "+65" },
    { name: "United Arab Emirates", code: "+971" },
  ];

  // 🔹 LOAD CUSTOMERS FROM INDEXEDDB
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <OfflineLoader />;

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      customer.firstName?.toLowerCase().includes(search) ||
      customer.lastName?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search)
    );
  });

  return (
    <div className="w-full h-full flex">
      {/* LEFT: CUSTOMER LIST */}
      <div className="customer-list py-2 w-3/5 bg-background flex flex-col h-full">
        <div className="customer-list-header mb-2 px-2.5">
          <h2 className="text-2xl font-semibold text-gray-700">Customers</h2>

          <div className="search relative mt-4 flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer..."
              className="p-2 pl-4 bg-white rounded-md w-4/5 shadow outline-0"
            />
            <span className="text-sm ml-auto">
              {filteredCustomers.length} Results
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pl-2.5">
          <CustomerList
            customers={filteredCustomers}
            onSelectEditCustomer={setSelectedCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="form w-2/5 overflow-y-auto">
        <AddCustomersForm
          selectedCustomer={selectedCustomer}
          clearSelection={() => setSelectedCustomer(null)}
          onAddCustomer={addCustomer}
          onEditCustomer={editCustomer}
          countries={countriesList}
        />
      </div>
    </div>
  );
};

export default Customers;
