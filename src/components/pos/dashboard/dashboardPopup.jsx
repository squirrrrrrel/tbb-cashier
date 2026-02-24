import React, { useEffect, useState } from "react";
import PrintOrder from "./PrintOrder";
import PhoneInputWithCode from "../../phoneCodeInput/PhoneInputWithCode";
import { useOrderStore } from "../../../store/useOrderStore";

/* ---------------- HELPER FOR UNDERLINING ---------------- */
const ShortcutLabel = ({ text, char }) => {
  const index = text.toLowerCase().indexOf(char.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  return (
    <span>
      {text.substring(0, index)}
      <span className="underline decoration-1 underline-offset-2">{text[index]}</span>
      {text.substring(index + 1)}
    </span>
  );
};

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
  handleWhatsApp,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- ACTIONS ---
  const onWhatsAppAction = () => {
    if (isOnline) {
      if (orderData?.customer?.phone_code && orderData?.customer?.phone_number) {
        handleWhatsApp();
      } else {
        setActivePopup("customer");
      }
    }
  };

  const onCancelAction = () => {
    setActivePopup(null);
    setPayToProceed(false);
    resetCart();
    setCartProducts([]);
  };

  const onPrintAction = () => setIsPrinting(true);

  // --- SHORTCUTS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger if user is typing in the Customer Name input or Phone input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (activePopup === "receipt") {
        const key = e.key.toLowerCase();

        if (key === "p") {
          e.preventDefault();
          onPrintAction();
        } else if (key === "w") {
          e.preventDefault();
          onWhatsAppAction();
        } else if (key === "n") {
          e.preventDefault();
          onCancelAction();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activePopup, isOnline, orderData]);

  // Online status listener
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  return (
    <>
      {/* ---------- RECEIPT POPUP ---------- */}
      {activePopup === "receipt" && (
        <div className="fixed inset-0 z-999 flex text-[#555555] items-center justify-center bg-black/20">
          <div className="bg-white rounded-md shadow-2xl w-150 py-4 px-5 animate-scale-in">
            <div className="py-2 text-center">
              <h2 className="text-2xl font-bold pb-2">Print Receipt</h2>
              <p className="text-gray-500 text-sm mt-2">
                Order <span className="font-bold text-gray-700">#{orderId}</span> is completed
              </p>
            </div>

            <div className="flex gap-4 p-2 text-sm">
              <button
                onClick={onWhatsAppAction}
                className={`flex-1 py-2 font-semibold text-white bg-[#15b71a] rounded-md ${
                  !isOnline ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Send <ShortcutLabel text="WhatsApp" char="w" />
              </button>

              <button
                onClick={onPrintAction}
                className="flex-1 py-2 font-bold text-white bg-gradient-to-b from-secondary to-primary rounded-md"
              >
                <ShortcutLabel text="Print" char="p" />
              </button>

              <button
                onClick={onCancelAction}
                className="flex-1 py-2 font-bold shadow rounded-md"
              >
                <ShortcutLabel text="Cancel" char="n" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CUSTOMER POPUP ---------- */}
      {activePopup === "customer" && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-md shadow-2xl w-[480px] p-6 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Add Customer Details</h2>

            <div className="space-y-5">
              <label className="text-sm font-semibold text-gray-600">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                placeholder="Enter Customer Name"
                onChange={handleCustomerChange}
                className="w-full p-3 bg-background shadow rounded-md text-sm mt-2"
              />

              <PhoneInputWithCode
                formData={customerDetails}
                setFormData={setCustomerDetails}
                onPhoneChange={handleCustomerChange}
              />
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => handleWhatsApp()}
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