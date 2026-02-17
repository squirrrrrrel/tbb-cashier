import React from "react";
import defaultImg from "./../../../assets/images/Default_Product_Img.png";
import { useState, useEffect } from "react";
import PrintInvoiceSlip from "./PrintInvoiceSlip";
import RefundPopup from "./RefundPopup";
import ExchangePopup from "./ExchangePopup";
import { useProductStore } from "../../../store/useProductStore";
import { normalizeOrderItemsForExchange } from "../../../helper/orderExchangeNormalizer";
const InvoiceFrom = ({ selectedOrder, onRefund, onExchange }) => {


  if (!selectedOrder) {

    return (
      <div className="flex  h-full text-[#555555] border-l border-gray-200 px-4 py-2 text-sm">
        No Orders
      </div>
    );
  }
  // 🔁 Exchange calculations (frontend only)
  const exchangeReturnTotal = (selectedOrder.orderItems || [])
    .filter(item => item.type === "RETURN")
    .reduce((sum, item) => sum + Math.abs(item.subtotal), 0);

  const exchangeNewTotal = (selectedOrder.orderItems || [])
    .filter(item => item.type === "EXCHANGE_NEW")
    .reduce((sum, item) => sum + item.subtotal, 0);

  const exchangeDiff = exchangeNewTotal - exchangeReturnTotal;

  const exchangeRefundAmount =
    exchangeDiff < 0 ? Math.abs(exchangeDiff) : 0;

  const exchangeReceiveAmount =
    exchangeDiff > 0 ? exchangeDiff : 0;

  const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
  useEffect(() => {
    productsHydrate();
  }, [productsHydrate]);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const [showRefund, setShowRefund] = useState(false);

  const [showExchange, setShowExchange] = useState(false);

  const testProductList = [
    { id: 1, product_name: "Bahama-Mint & Lime Mojito-Can-440mL", selling_price: 25.00 },
    { id: 2, product_name: "Bahama-Pina Colada-Can-440mL", selling_price: 28.50 },
    { id: 3, product_name: "Carling Black Label-Bottle-750mL", selling_price: 45.00 },
    { id: 4, product_name: "Castle Lite-Can-500ml", selling_price: 32.00 },
    { id: 5, product_name: "Coca Cola-Original-Bottle-2L", selling_price: 38.00 },
    { id: 6, product_name: "Corona-Extra-Can-410mL", selling_price: 55.00 },
    { id: 7, product_name: "Gordons-Pink & Tonic-Can-440mL", selling_price: 42.00 },
    { id: 8, product_name: "Heineken-Original Malt Lager-330mL", selling_price: 35.00 },
    { id: 9, product_name: "Hunter-Extreme Apple-Can-440mL", selling_price: 40.00 },
    { id: 10, product_name: "O3-Still Water-Bottle-500mL", selling_price: 12.00 },
    { id: 11, product_name: "Schweppes-Dry Lemon-Can-200mL", selling_price: 18.00 },
  ];

  const tax = (selectedOrder.orderItems || []).reduce((acc, item) => {
    if (!item) return acc;
    const itemTax = item.taxPercentagePerProduct
      ? (item.itemSubtotal * item.taxPercentagePerProduct) / 100
      : 0;
    return acc + itemTax;
  }, 0);


  const shouldDisableRefund = () => {
    return (
      selectedOrder?.orderItems?.filter(
        (item) => item?.quantity - (item?.refundQuantity) > 0
      )?.length === 0
    );
  };

  const shouldDisableByCategory = () => {
    const categories =
      selectedOrder?.orderItems?.map((item) =>
        (item?.category_name || "").toLowerCase()
      ) || [];
    return (
      categories.length > 0 &&
      categories.every((cat) => ["butchery", "shots"].includes(cat))
    );
  };

  // const isDisabled = shouldDisableRefund() || shouldDisableByCategory();
  const isDisabled = selectedOrder?.orderStatus === "REFUNDED" || shouldDisableRefund() || shouldDisableByCategory();

  const exchangeableItems =
    normalizeOrderItemsForExchange(selectedOrder?.orderItems || []);
  return (
    <div className="pt-2.5 px-5 pb-2 flex flex-col h-full border-l border-gray-200">
      <div className="text-xl flex items-center justify-between  gap-2 pb-2.5">
        <div className="bg-gradient-to-b from-secondary to-primary text-white font-bold py-1.5 px-2  rounded-md">
          {`Invoice ${selectedOrder.display_id}`}
        </div>
        {/* {selectedOrder.cartData?.table && (
          <div className="ml-auto">
            <span className="flex gap-2 items-center text-[#555555]">
              <svg
                style={{ width: "28px" }}
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 214.539 214.539"
              >
                <g>
                  <g>
                    <path d="M121.164,154.578h-6.625V89.14h38.937c4.014,0,7.269-3.254,7.269-7.269s-3.254-7.269-7.269-7.269h-92.41 c-4.014,0-7.269,3.254-7.269,7.269s3.254,7.269,7.269,7.269h38.936v65.438h-6.625c-4.014,0-7.269,3.254-7.269,7.27 c0,4.015,3.254,7.269,7.269,7.269h27.787c4.015,0,7.27-3.254,7.27-7.269C128.433,157.832,125.179,154.578,121.164,154.578z"></path>
                    <path d="M73.783,120.777c0-4.014-3.254-7.269-7.269-7.269H54.833H34.219c-11.08,0-13.41-16.14-13.509-16.869l-6.239-45.122 c-0.55-3.977-4.217-6.748-8.196-6.205c-3.976,0.55-6.754,4.219-6.205,8.196l6.229,45.053c0.831,6.47,4.167,16.593,11.367,23.133 l-7.485,38.956c-0.758,3.942,1.824,7.752,5.766,8.509c3.946,0.761,7.752-1.825,8.509-5.766l6.792-35.349h17.579l6.792,35.349 c0.668,3.479,3.714,5.897,7.13,5.897c0.455,0,0.916-0.043,1.379-0.132c3.942-0.757,6.524-4.566,5.766-8.509l-6.265-32.605h2.883 C70.527,128.046,73.783,124.791,73.783,120.777z"></path>
                    <path d="M208.267,45.313c-3.975-0.543-7.646,2.229-8.196,6.205l-6.244,45.165c-0.094,0.687-2.424,16.827-13.504,16.827h-20.614 h-11.681c-4.014,0-7.27,3.254-7.27,7.269s3.255,7.269,7.27,7.269h2.883l-6.265,32.605c-0.758,3.942,1.824,7.752,5.766,8.509 c3.946,0.761,7.752-1.825,8.509-5.766l6.792-35.349h17.579l6.792,35.349c0.668,3.479,3.714,5.897,7.13,5.897 c0.455,0,0.916-0.043,1.38-0.132c3.941-0.757,6.523-4.566,5.766-8.509l-7.485-38.953c7.198-6.534,10.532-16.64,11.357-23.065 l6.238-45.123C215.021,49.533,212.242,45.863,208.267,45.313z"></path>
                  </g>
                </g>
              </svg>
              Table {selectedOrder.cartData?.table.tableName}
            </span>
          </div>
        )} */}
        <div className="flex justify-centre gap-2 align-centre ml-auto text-lg text-[#555555]">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="user"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
          </svg>
          <p className="leading-none flex items-center">
            {selectedOrder.customerId}
          </p>

        </div>
      </div>
      <div className="border-b border-gray-300 pb-1 text-[13px] text-[#555555] font-bold">
        ORIGINAL ITEMS
      </div>

      <div className="flex flex-col mt-2 overflow-auto no-scrollbar text-[#888888] font-bold text-sm">
        {(selectedOrder.orderItems || selectedOrder.items || []).filter(item => item.type !== "EXCHANGE_NEW" && item.type !== "RETURN").map((item, index) => (
          <div
            key={item.productId}
            className={`flex items-center justify-between py-1 px-2 rounded-md ${index % 2 === 0 ? "bg-white" : "bg-[#f8f8f8] "}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-md ">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <img src={defaultImg} alt={item.productName} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <p className=" text-[#6f6f6f]">
                  {item.productName || item.name}
                </p>
                <div className="flex gap-2">
                  P{item.unitPrice || item.price} × {item.shots ? item.shots : item.quantity} {item.category_name === "Butchery" ? "kg" : item.shots ? `(${item.quantity / item.shots}ml each)` : "pcs"}

                  {/* --- REFUND HISTORY SECTION --- */}
                  {selectedOrder.refunded > 0 && (
                    <div>
                      {(() => {
                        const totalReturned = (selectedOrder.refundHistory || []).reduce((acc, refund) => {
                          const match = refund.items?.find(ri => ri.orderItemId === item.productId);
                          return acc + (match ? match.quantity : 0);
                        }, 0);

                        if (item.refundQuantity <= 0) return null;

                        return (
                          <div className="flex items-center font-bold text-sm text-[#15b71a] ">
                            <svg
                              viewBox="64 64 896 896"
                              width="14px"
                              height="14px"
                              fill="currentColor"
                            >
                              <path d="M511.4 124C290.5 124.3 112 303 112 523.9c0 128 60.2 242 153.8 315.2l-37.5 48c-4.1 5.3-.3 13 6.3 12.9l167-.8c5.2 0 9-4.9 7.7-9.9L369.8 727a8 8 0 00-14.1-3L315 776.1c-10.2-8-20-16.7-29.3-26a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-7.5 7.5-15.3 14.5-23.4 21.2a7.93 7.93 0 00-1.2 11.1l39.4 50.5c2.8 3.5 7.9 4.1 11.4 1.3C854.5 760.8 912 649.1 912 523.9c0-221.1-179.4-400.2-400.6-399.9z"></path>
                            </svg>
                            <span>{item.refundQuantity}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div>
              P{item.subtotal || item.total}
            </div>
          </div>
        ))}
        {/* --- Bottom of the Items List Section --- */}
        {selectedOrder?.orderItems?.some(
          item => item.type === "RETURN" || item.type === "EXCHANGE_NEW"
        ) && (
            <div className="mt-3">
              <h3 className="text-md font-bold text-[#555555] uppercase pb-1 border-b border-gray-300">
                Exchanges
              </h3>

              {/* 🔴 RETURN ITEMS */}
              {selectedOrder.orderItems
                .filter(item => item.type === "RETURN")
                .map((item, i) => (
                  <div
                    key={item.orderItemId}
                    className={`flex my-1 py-2 px-1 rounded-lg justify-between items-center text-sm font-bold text-red-500 border-b border-dashed border-gray-300 ${i % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"
                      }`}
                  >
                    <div className="flex gap-2">
                      <img src={item.imageUrl || defaultImg} className="w-12 h-12" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[#e74c3c]">{item.productName}</span>
                        <span className="text-gray-500">
                          P{item.unitPrice} × {Math.abs(item.quantity)} (Old Item)
                        </span>
                      </div>
                    </div>
                    <span>-P{Math.abs(item.subtotal)}</span>
                  </div>
                ))}

              {/* 🟢 EXCHANGE NEW ITEMS */}
              {selectedOrder.orderItems
                .filter(item => item.type === "EXCHANGE_NEW")
                .map((item, i) => (
                  <div
                    key={item.orderItemId}
                    className={`flex my-1 py-2 px-1 rounded-lg justify-between items-center text-sm font-bold border-b border-dashed border-gray-300 ${i % 2 === 0 ? "bg-[#f8f8f8]" : "bg-white"
                      }`}
                  >
                    <div className="flex gap-2">
                      <img src={item.imageUrl || defaultImg} className="w-12 h-12" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[#15b71a]">{item.productName}</span>
                        <span className="text-gray-500 flex gap-2">
                          P{item.unitPrice} × {item.quantity} (New Item)
                          {item.refundQuantity > 0 && (
                            <div>
                                  <div className="flex items-center font-bold text-sm text-[#15b71a] ">
                                    <svg
                                      viewBox="64 64 896 896"
                                      width="14px"
                                      height="14px"
                                      fill="currentColor"
                                    >
                                      <path d="M511.4 124C290.5 124.3 112 303 112 523.9c0 128 60.2 242 153.8 315.2l-37.5 48c-4.1 5.3-.3 13 6.3 12.9l167-.8c5.2 0 9-4.9 7.7-9.9L369.8 727a8 8 0 00-14.1-3L315 776.1c-10.2-8-20-16.7-29.3-26a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-7.5 7.5-15.3 14.5-23.4 21.2a7.93 7.93 0 00-1.2 11.1l39.4 50.5c2.8 3.5 7.9 4.1 11.4 1.3C854.5 760.8 912 649.1 912 523.9c0-221.1-179.4-400.2-400.6-399.9z"></path>
                                    </svg>
                                    <span>{item.refundQuantity}</span>
                                  </div>
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#15b71a]">
                      P{item.subtotal}
                    </span>
                  </div>
                ))}
            </div>
          )}

      </div>
      <div className="mt-auto pt-2.5 px-6 border-t border-gray-200 text-sm sticky bottom-0 bg-white">
        <div className="text-[#555555] font-bold space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <span>P{selectedOrder?.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <p>Tax</p>
            <span>P{selectedOrder?.taxAmount}</span>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <span>P{selectedOrder.discountAmount}</span>
          </div>
          <div className="flex justify-between text-secondary font-bold text-xl">
            <p>Total</p>
            <span>P{selectedOrder?.totalAmount}</span>
          </div>
          <div className="flex justify-between text-[#15b71a]">
            <p>Refunded</p>
            <span>P{selectedOrder.refunded || 0.00}</span>
          </div>
          <div className="flex justify-between text-[#15b71a]">
            <p>Exchanged{exchangeRefundAmount ? "(Refund)" : exchangeReceiveAmount ? "(Receive)" : ""}</p>
            <span>P{exchangeReceiveAmount ? exchangeReceiveAmount.toFixed(2) : exchangeRefundAmount.toFixed(2)}</span>
          </div>
          {selectedOrder?.payments?.map((item, i) => (
            <div className="flex justify-between">
              <p className="capitalize">{item?.paymentMethod || item.name} (tendered Amount)</p>
              <span>P{item?.amount}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <p>Change</p>
            <span>P{selectedOrder?.isSynced ? selectedOrder?.transactions?.[0]?.cashReturned : selectedOrder?.cashReturned}</span>
          </div>
        </div>

        <div className="mt-2">
          <button className="bg-gradient-to-b from-secondary to-primary text-white text-sm font-bold w-full py-4 px-2 rounded-md flex items-center justify-center gap-2 cursor-pointer"
            style={{ cursor: "pointer" }}
            onClick={() => setShowPrintSlip(true)}
          >
            <span
              role="img"
              aria-label="printer"
              className="anticon anticon-printer"
            >
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="printer"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M820 436h-40c-4.4 0-8 3.6-8 8v40c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-40c0-4.4-3.6-8-8-8zm32-104H732V120c0-4.4-3.6-8-8-8H300c-4.4 0-8 3.6-8 8v212H172c-44.2 0-80 35.8-80 80v328c0 17.7 14.3 32 32 32h168v132c0 4.4 3.6 8 8 8h424c4.4 0 8-3.6 8-8V772h168c17.7 0 32-14.3 32-32V412c0-44.2-35.8-80-80-80zM360 180h304v152H360V180zm304 664H360V568h304v276zm200-140H732V500H292v204H160V412c0-6.6 5.4-12 12-12h680c6.6 0 12 5.4 12 12v292z"></path>
              </svg>
            </span>
            Print Invoice
          </button>
        </div>



        <div className="flex gap-2 mt-2 text-sm">
          <div className="w-1/2">
            <button className={`bg-[#15b71a] w-full text-white font-bold py-4 px-2 rounded-md flex items-center justify-center gap-2 cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
              disabled={isDisabled}
              onClick={() => setShowRefund(true)}
            >
              <span
                role="img"
                aria-label="undo"
                className="anticon anticon-undo"
              >
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="undo"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M511.4 124C290.5 124.3 112 303 112 523.9c0 128 60.2 242 153.8 315.2l-37.5 48c-4.1 5.3-.3 13 6.3 12.9l167-.8c5.2 0 9-4.9 7.7-9.9L369.8 727a8 8 0 00-14.1-3L315 776.1c-10.2-8-20-16.7-29.3-26a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-7.5 7.5-15.3 14.5-23.4 21.2a7.93 7.93 0 00-1.2 11.1l39.4 50.5c2.8 3.5 7.9 4.1 11.4 1.3C854.5 760.8 912 649.1 912 523.9c0-221.1-179.4-400.2-400.6-399.9z"></path>
                </svg>
              </span>
              Refund
            </button>
          </div>
          <div className="w-1/2">
            <button className={`bg-[#15b71a] w-full text-white font-bold py-2.75 px-2 rounded-md flex items-center justify-center gap-2 cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}

              disabled={isDisabled}
              onClick={() => setShowExchange(true)}
            >
              <span
                role="img"
                aria-label="undo"
                className="anticon anticon-undo"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  height="30"
                  width="30"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="32"
                    d="m304 48 112 112-112 112m94.87-112H96m112 304L96 352l112-112m-94 112h302"
                  ></path>
                </svg>
              </span>
              Exchange
            </button>
          </div>
        </div>
      </div>
      <PrintInvoiceSlip
        show={showPrintSlip}
        setShow={setShowPrintSlip}
        orderDetails={selectedOrder}
        productList={testProductList}
      />
      <RefundPopup
        open={showRefund}
        disabled={isDisabled}
        onClose={() => setShowRefund(false)}
        items={exchangeableItems}
        orderId={selectedOrder?.orderId} // Pass the ID
        onProcessRefund={onRefund}      // Pass the function
      />
      <ExchangePopup
        open={showExchange}
        onClose={() => setShowExchange(false)}
        disabled={isDisabled}
        items={exchangeableItems}
        products={products} // You need to pass your master product list here
        onExchange={onExchange}
        orderId={selectedOrder?.orderId}
      />
    </div>
  );
}

export default InvoiceFrom;