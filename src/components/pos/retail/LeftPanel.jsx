import React, { useEffect } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { usePromotionStore } from "../../../store/usePromotionStore";
import { useNotification } from "../../../hooks/useNotification";

const LeftPanel = ({ setTotalAmount, getFinalProductPrice }) => {
  const { cartData, updateQuantity, removeFromCart } = useCartStore();
  const { notifyError } = useNotification();


  //promotions
  const outletId = useAuthStore.getState().user?.outlet_id;
  const { promotions, hydrate: promoHydrate, hydrated: promoHydarated } = usePromotionStore();

  // --- Calculate Total Amount for the entire cart ---
  useEffect(() => {
    const total = cartData.reduce((acc, item) => {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      return acc + (price * qty);
    }, 0);

    if (setTotalAmount) setTotalAmount(total);
  }, [cartData, setTotalAmount]);

  const changeQuantity = (method, item) => {
    if (method === "inc") {
      const maxQty = item.stock + item.stockQueue;
      const newQty = item.quantity + 1;
      if (newQty > maxQty) {
        notifyError(<>Only <span style={{ color: "red" }}>{item.stock + item.stockQueue}</span> items available in<br />stock for {item.name}</>);
        return;
      }
      updateQuantity(item.id, newQty);
    } else {
      const newQty = item.quantity - 1;
      if (newQty <= 0) {
        // removeFromCart(item.id);
        return;
      }
      updateQuantity(item.id, newQty);
    }
  }



  return (
    <div className="h-full m-5 rounded-md bg-white flex flex-col overflow-hidden border border-gray-200">

      {/* BARCODE SEARCH SECTION */}


      {/* TABLE HEADER */}
      <div className="sticky top-0 z-10">
        <div className="flex text-sm font-semibold text-white bg-gradient-to-b from-secondary to-primary">
          <div className="flex-1 flex">
            <div className="flex-1 w-1/4 px-3 py-3">Barcode</div>
            <div className="flex-1 w-1/4 px-3 py-3">Item</div>
          </div>
          <div className="flex-1 w-2/4  py-3">
            <div className="grid grid-cols-4 text-center">
              <span>Unit</span>
              <span>Qty</span>
              <span>Discount</span>
              <span>Subtotal</span>
            </div>
          </div>
          <span className="delete-btn cursor-pointer pr-10 m-auto text-red-400"></span>
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="flex-1 overflow-y-auto text-sm text-[#555555]">
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p>Scan or Select Product to start</p>
          </div>
        ) : (
          cartData.map((item, index) => {
            const unitPrice = item.price + item.discount || 0;
            // const unitPrice = price || 0;
            const quantity = item.quantity || 1;
            const discountValue = (item.discount * quantity).toFixed(2);
            const subtotal = (unitPrice * quantity) - discountValue;

            return (
              <div key={item.serverId || index} className="flex border-b border-gray-100 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 flex">
                  <div className="px-3 flex-1 font-mono text-xs self-center">{item.barcode || "N/A"}</div>
                  <div className="px-3 flex-1 font-medium self-center">{item.name}</div>
                </div>
                {/* <div className="flex-1 self-center"> */}
                <div className="flex-1 grid grid-cols-4 text-center items-center">
                  <span className="text-gray-400">P {unitPrice}</span>
                  {/* <span className="font-bold">{quantity}</span> */}
                  <span className="font-bold">
                    <div className="flex w-full h-10 items-center justify-between bg-white overflow-hidden  border border-gray-200">
                      <div
                        onClick={() => changeQuantity("dec", item)}
                        className="w-10 pb-0.5 h-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-b from-secondary to-primary cursor-pointer"
                      >
                        -
                      </div>
                      <span>{quantity}</span>
                      <div
                        onClick={() => changeQuantity("inc", item)}
                        className="w-10 h-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-b from-secondary to-primary cursor-pointer"
                      >
                        +
                      </div>
                    </div>
                  </span>
                  <span className="text-red-400">P{discountValue}</span>
                  <span className="font-semibold text-gray-800">P {subtotal.toFixed(2)}</span>
                </div>
                {/* </div> */}
                <span className="delete-btn cursor-pointer w-5 pr-10 m-auto text-red-400" onClick={() => removeFromCart(item.id)}>
                  <svg
                    viewBox="64 64 896 896"
                    focusable="false"
                    data-icon="delete"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                  </svg>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeftPanel;