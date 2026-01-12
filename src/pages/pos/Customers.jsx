import React from "react";
import AddCustomersForm from "../../components/pos/customers/AddCustomersForm";
import CustomerList from "./../../components/pos/customers/CustomerList";
import { useState } from "react";
import { useNotification } from "../../hooks/useNotification";

const Customers = () => {

  const { notifyError, notifySuccess } = useNotification();


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

  const customerList = [
    {
      id: 1,
      firstName: "Rahul",
      lastName: "Sharma",
      phone: "9876543210",
      email: "rahul@gmail.com",
      phoneCode: "+91",
    },
    {
      id: 2,
      firstName: "Anita",
      lastName: "Verma",
      phone: "9123456789",
      email: "anita@gmail.com",
      phoneCode: "+91",
    },
    {
      id: 3,
      firstName: "Amit",
      lastName: "Patel",
      phone: "9898123456",
      email: "amit.patel@gmail.com",
      phoneCode: "+91",
    },
    {
      id: 4,
      firstName: "Sneha",
      lastName: "Mehta",
      phone: "9876541123",
      email: "sneha.mehta@gmail.com",
    },
    {
      id: 5,
      firstName: "Rohit",
      lastName: "Kumar",
      phone: "9123457890",
      email: "rohit.kumar@gmail.com",
    },

  ]

  const handleDeleteCustomer = (id) => {
    try {
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (error) {
      notifyError("Failed to delete customer");
      console.error("Delete Customer Error:", error);
    } finally {
      notifySuccess("Customer deleted successfully");
    }
  };

  const handleEditCustomer = (formData) => {
    setCustomers(
      customers.map((cust) =>
        cust.id === selectedCustomer.id
          ? { ...formData, id: selectedCustomer.id }
          : cust
      )
    );

  };

  const handleAddCustomer = (formData) => {
    formData.id = customers.length + 1;
    setCustomers([
      ...customers,
      formData,
    ]);
  }

  const [customers, setCustomers] = useState(customerList);


  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      customer.firstName.toLowerCase().includes(search) ||
      customer.lastName.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.phone.includes(search)
    );
  });


  return (
    <div className="w-full h-full flex ">
      <div className="customer-list py-2 w-3/5 bg-background  flex flex-col h-full mb-1">

        <div className="customer-list-header bg-background mb-2 px-2.5">
          <h2 className="text-2xl font-semibold text-gray-700">Customers</h2>
          <div className="search relative mt-4 flex items-center gap-3 ">
            <svg
              className="absolute text-lg left-3 top-3 w-4 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Customer by name, email or phone...."
              className="p-2 pl-10  bg-white rounded-md w-4/5 shadow-[0_0_3px_#00000026] outline-0 cursor-text placeholder:text-[#555555] placeholder:text-sm"
            />
            <span className="text-sm text-[#555555] ml-auto pr-0.5">
              {filteredCustomers.length} Results
            </span>
          </div>
        </div>

        {/*CUSTOMER LIST */}
        <div className=" bg-background flex-1 overflow-y-auto pl-2.5 ">
          <CustomerList
            customers={filteredCustomers}
            onSelectEditCustomer={setSelectedCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        </div>

      </div>

      <div className="form w-2/5 flex-2 overflow-y-auto">
        <AddCustomersForm
          selectedCustomer={selectedCustomer}
          clearSelection={() => setSelectedCustomer(null)}
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
          countries={countriesList}

        />
      </div>
    </div>
  );
};

export default Customers;
