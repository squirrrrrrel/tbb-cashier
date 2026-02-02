import React, {useEffect } from "react";
import { useCartStore } from "../../../store/useCartStore";

const LeftPanel = ({ setTotalAmount }) => {
  const { cartData } = useCartStore();
  const discountValue = 0; // As requested, initial constant

  // --- Calculate Total Amount for the entire cart ---
  useEffect(() => {
    const total = cartData.reduce((acc, item) => {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      return acc + (price * qty - discountValue);
    }, 0);
    
    if (setTotalAmount) setTotalAmount(total);
  }, [cartData, setTotalAmount]);



  return (
    <div className="h-full m-5 rounded-md bg-white flex flex-col overflow-hidden border border-gray-200">
      
      {/* BARCODE SEARCH SECTION */}
    

      {/* TABLE HEADER */}
      <div className="sticky top-0 z-10">
        <div className="flex text-sm font-semibold text-white bg-gradient-to-b from-secondary to-primary">
          <div className="w-1/4 px-3 py-3">Barcode</div>
          <div className="w-1/4 px-3 py-3">Item</div>
          <div className="w-2/4 px-3 py-3">
            <div className="grid grid-cols-4 text-center">
              <span>Unit</span>
              <span>Qty</span>
              <span>Disc %</span>
              <span>Subtotal</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="flex-1 overflow-y-auto text-sm text-[#555555]">
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4">
               <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
               <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Scan or Select Product to start</p>
          </div>
        ) : (
          cartData.map((item, index) => {
            const unitPrice = item.price || 0;
            const quantity = item.quantity || 1;
            const subtotal = (unitPrice * quantity) - discountValue;

            return (
              <div key={item.serverId || index} className="flex border-b border-gray-100 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-1/4 px-3 font-mono text-xs self-center">{item.barcode || "N/A"}</div>
                <div className="w-1/4 px-3 font-medium self-center">{item.name}</div>
                <div className="w-2/4 self-center">
                  <div className="grid grid-cols-4 text-center items-center">
                    <span className="text-gray-400">P {unitPrice.toFixed(2)}</span>
                    <span className="font-bold">{quantity}</span>
                    <span className="text-red-400">{discountValue}%</span>
                    <span className="font-semibold text-gray-800">P {subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeftPanel;