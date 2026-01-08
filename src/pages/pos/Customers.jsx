import React from "react";
import AddCustomersForm from "../../components/pos/customers/AddCustomersForm";

const Customers = () => {
  return (
    <div className="w-full h-screen flex">
      <div className="customer-list w-3/5 bg-background p-4 bg-background">
        <h2 className="text-2xl font-semibold text-gray-700">Customers</h2>
        <div className="search relative w-2/3 mt-4">
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
            placeholder="Search Customer By Name, Email or Phone Number"
            className="p-2 pl-10 border border-gray-200 bg-white rounded-md w-full shadow-sm outline-0 cursor-text"
          />
        </div>
      </div>
      <div className="form w-2/5">
        <AddCustomersForm />
      </div>
    </div>
  );
};

export default Customers;
