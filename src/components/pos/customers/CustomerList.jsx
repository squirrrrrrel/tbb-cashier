import React from "react";
// import { Pencil } from "lucide-react";
import { AiOutlineEdit, AiOutlineDelete , AiOutlineCheck, AiOutlineMail, AiOutlinePhone   } from "react-icons/ai";
import userImg from "../../../assets/images/user.png";
import { useNavigate } from "react-router-dom";


const CustomerList = ({ customers, onSelectEditCustomer, onDeleteCustomer, setSelectedCustomer, selectedCustomer }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* List */}
      <div className=" mt-1 w-full h-full bg-background ">
        {customers.map((customer) => (
          <div
            key={customer.localId}
            className="flex justify-between shadow-[0_0_3px_#00000028] rounded-md py-1   mr-3 mb-3 bg-white items-stretch"
          >
            {/* LEFT: USER INFO */}
          <div className="flex  gap-2 mx-1">
            {/* User Icon */}
            <div className="flex items-center justify-center text-4xl ml-1">
             <img src={userImg} className="rounded-full w-15" />
            </div>

            {/* Name + Details */}
            <div>
              <p className="font-semibold leading-tight  text-secondary text-lg m-0 ">
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
          <div className="flex items-center gap-1.5 mr-3">
            <button
              onClick={() => onSelectEditCustomer(customer)}
              className="px-2 py-2.5 rounded-md  border-gray-100 bg-white-100 text-[#555555] hover:bg-gray-200 hover:px-1.75 hover:py-2.25 hover:m-0.25  hover:shadow-none flex items-center text-xl shadow-[0_0_3px_#00000026]"
            >
              <AiOutlineEdit />
            </button>

            <button
              onClick={() => onDeleteCustomer(customer.localId)}
              className="px-2 py-2.5 rounded-md bg-white-100  text-red-500 hover:bg-gray-200  hover:px-1.75 hover:py-2.25 hover:m-0.25 flex items-center hover:shadow-none text-xl shadow-[0_0_3px_#00000026]"
            >
              <AiOutlineDelete />
            </button>

            <button
              onClick={selectedCustomer?.localId== customer.localId ? ()=> setSelectedCustomer({}): ()=> {setSelectedCustomer(customer); navigate("/pos/dashboard")}}
              className="px-2 py-1.5 rounded-md bg-white-100   text-[#555555] font-normal  flex items-center gap-1 text-lg hover:bg-gray-200 hover:px-1.75 hover:py-1.25 hover:m-0.25 hover:shadow-none shadow-[0_0_3px_#00000026]"
            >
              <AiOutlineCheck className={`${selectedCustomer?.localId== customer.localId ? "text-green-500":"text-black"}`} />
              {selectedCustomer?.localId== customer.localId ? "Current Customer":"Set Customer"}
              
            </button>
          </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CustomerList;
