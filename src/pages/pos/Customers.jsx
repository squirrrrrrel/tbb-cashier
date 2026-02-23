import React, { useEffect, useState } from "react";
import AddCustomersForm from "../../components/pos/customers/AddCustomersForm";
import CustomerList from "../../components/pos/customers/CustomerList";
import OfflineLoader from "../../components/OfflineLoader";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCartStore } from "../../store/useCartStore";
import SearchBar from "../../components/searchBar/SearchBar";
import { countriesList } from "../../store/countryStore";

const Customers = () => {
  const {
    customers,
    hydrate,
    hydrated,
    addCustomer,
    editCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const { selectedCustomer, setSelectedCustomer } = useCartStore();
  const [focusedCustomer, setFocusedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  // const countriesList = [
  //   { name: "India", code: "+91" },
  //   { name: "United States", code: "+1" },
  //   { name: "United Kingdom", code: "+44" },
  //   { name: "Canada", code: "+1" },
  //   { name: "Australia", code: "+61" },
  //   { name: "Germany", code: "+49" },
  //   { name: "France", code: "+33" },
  //   { name: "Italy", code: "+39" },
  //   { name: "Spain", code: "+34" },
  //   { name: "Netherlands", code: "+31" },
  //   { name: "Brazil", code: "+55" },
  //   { name: "Mexico", code: "+52" },
  //   { name: "Russia", code: "+7" },
  //   { name: "China", code: "+86" },
  //   { name: "Japan", code: "+81" },
  //   { name: "South Korea", code: "+82" },
  //   { name: "South Africa", code: "+27" },
  //   { name: "New Zealand", code: "+64" },
  //   { name: "Singapore", code: "+65" },
  //   { name: "United Arab Emirates", code: "+971" },
  // ];

  // 🔹 LOAD CUSTOMERS FROM INDEXEDDB
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <OfflineLoader />;

const filteredCustomers = React.useMemo(() => {
  const search = searchTerm.toLowerCase();

  return customers
    .filter((customer) => {
      return (
        customer.firstName?.toLowerCase().includes(search) ||
        customer.lastName?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.includes(search)
      );
    })
    // STABILIZE: Sort by localId or Date created so they never swap
    .sort((a, b) => (a.localId > b.localId ? -1 : 1)); 
}, [customers, searchTerm]);

  return (
    <div className="w-full h-full flex">
      {/* LEFT: CUSTOMER LIST */}
      <div className="customer-list py-2 flex-grow bg-background flex flex-col h-full">
        <div className="customer-list-header mb-2 px-2.5">
          <h2 className="text-2xl font-semibold text-gray-700">Customers</h2>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search Customer By Name, Number and Email"
            resultCount={filteredCustomers.length}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pl-2.5">
          {filteredCustomers.length === 0 ? <div>No Customer Found</div> : <CustomerList
            customers={filteredCustomers}
            onSelectEditCustomer={setFocusedCustomer}
            onDeleteCustomer={deleteCustomer}
            setSelectedCustomer={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
          />}

        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="form w-[35vw] overflow-y-auto no-scrollbar">
        <AddCustomersForm
          focusedCustomer={focusedCustomer}
          clearSelection={() => setFocusedCustomer(null)}
          onAddCustomer={addCustomer}
          onEditCustomer={editCustomer}
          countries={countriesList}
        />
      </div>
    </div>
  );
};

export default Customers;