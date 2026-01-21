
import React from "react";
import PrintOrder from "./PrintOrder";
import PhoneInputWithCode from "../../phoneCodeInput/PhoneInputWithCode";

const DashboardPopup = ({
  activePopup,
  setActivePopup,
  orderId,
  isPrinting,
  setIsPrinting,
  orderData,
  customerDetails,
  setCustomerDetails,
  handleCustomerChange,
  resetCart,
  setCartProducts,
  setPayToProceed,
}) => {
  return (
    <>
      {/* ---------- RECEIPT POPUP ---------- */}
      {activePopup === "receipt" && (
        <div className="fixed inset-0 z-50 flex text-[#555555] items-center justify-center bg-black/20">
          <div className="bg-white rounded-md shadow-2xl w-150 py-4 px-5 animate-in zoom-in duration-200">
            <div className="py-2 text-center">
              <h2 className="text-2xl font-bold pb-2">Print Receipt</h2>
              <p className="text-gray-500 text-sm mt-2">
                Order <span className="font-bold text-gray-700">#{orderId}</span> is completed
              </p>
            </div>

            <div className="flex gap-4 p-2 text-sm">
              <button
                onClick={() => setActivePopup("customer")}
                className="flex-1 py-2 font-semibold text-white bg-[#15b71a] rounded-md"
              >
                Send WhatsApp
              </button>

              <button
                onClick={() => setIsPrinting(true)}
                className="flex-1 py-2 font-bold text-white bg-gradient-to-b from-secondary to-primary rounded-md"
              >
                Print
              </button>

              <button
                onClick={() => {
                  setActivePopup(null);
                  setPayToProceed(false);
                  resetCart();
                  setCartProducts([]);
                }}
                className="flex-1 py-2 font-bold shadow rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CUSTOMER POPUP ---------- */}
      {activePopup === "customer" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-md shadow-2xl w-[480px] p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Add Customer Details
            </h2>

            <div className="space-y-5">
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                placeholder="Enter Customer Name"
                onChange={handleCustomerChange}
                className="w-full p-3 bg-background shadow rounded-md text-sm"
              />

              <PhoneInputWithCode
                formData={customerDetails}
                setFormData={setCustomerDetails}
                onPhoneChange={handleCustomerChange}
              />
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setActivePopup("receipt")}
                className="flex-1 py-3 text-white font-bold rounded-md bg-[#15b71a]"
              >
                Send WhatsApp
              </button>

              <button
                onClick={() => setActivePopup("receipt")}
                className="flex-1 py-3 shadow rounded-md font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PRINT ---------- */}
      {isPrinting && (
        <PrintOrder
          show={isPrinting}
          setShow={setIsPrinting}
          finalOrderData={orderData}
        />
      )}
    </>
  );
};

export default DashboardPopup;
