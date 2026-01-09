import React from "react";
// import { Pencil } from "lucide-react";
import { AiOutlineEdit, AiOutlineDelete , AiOutlineCheck, AiOutlineMail, AiOutlinePhone   } from "react-icons/ai";

const CustomerList = ({ customers, onSelectEditCustomer, onDeleteCustomer }) => {
  return (
    <>
      {/* List */}
      <div className="mt-4   w-full h-full bg-background ">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex justify-between  p-1 shadow rounded-md mb-2 mr-2 bg-white hover:bg-gray-50 items-stretch"
          >
            {/* LEFT: USER INFO */}
          <div className="flex  gap-2">
            {/* User Icon */}
            <div className="flex items-center justify-center h-full text-4xl ml-1">
              <img src="../../../../src/assets/images/user.png"  className=" rounded-full w-15" />
            </div>

            {/* Name + Details */}
            <div>
              <p className="font-semibold text-[#117892] text-xl">
                {customer.firstName} {customer.lastName}
              </p>

              <div className="flex flex-col text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <AiOutlineMail className="text-base"/>
                  {customer.email || "—"}
                </span>
                <span className="flex items-center gap-2">
                  <AiOutlinePhone  className="text-base"/>
                  {customer.phoneCode +"-"}
                  {customer.phone}
                </span>
              </div>
            </div>
          </div>

           {/* RIGHT: ACTION BUTTONS */}
          <div className="flex items-center gap-1 mr-3">
            <button
              onClick={() => onSelectEditCustomer(customer)}
              className="px-3 py-2.5 rounded-md border-2 border-gray-100 bg-white-100 text-black-700 hover:bg-gray-200 hover:px-2.5 hover:py-2 hover:m-0.5 flex items-center gap-1 text-xl"
            >
              <AiOutlineEdit />
            </button>

            <button
              onClick={() => onDeleteCustomer(customer.id)}
              className="px-3 py-2.5 rounded-md bg-white-100  border-2 border-gray-100 text-red-500 hover:bg-gray-200 hover:px-2.5 hover:py-2 hover:m-0.5 flex items-center gap-1 text-xl"
            >
              <AiOutlineDelete />
            </button>

            <button
              className="px-3 py-2 rounded-md bg-white-100  border-2 border-gray-100 text-gray-700 font-normal  flex items-center gap-1 text-l hover:bg-gray-200 hover:px-2.5 hover:py-1.5 hover:m-0.5"
            >
              <AiOutlineCheck  />
              Set Customer
            </button>
          </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CustomerList;
