"use client";
import React, { useState, useRef, useEffect } from "react";
import arrowDownIcon from "../../../assets/icons/arrow_down.svg";
import keyup from "../../../assets/icons/keyup.svg";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../hooks/useNotification";
import { useCartStore } from "../../../store/useCartStore";
import defaultImg from "../../../assets/images/Default_Product_Img.png";
import { useHoldOrderStore } from "../../../store/useHoldOrderStore";

import { useAuthStore } from "../../../store/useAuthStore";

/* ---------------- CART ITEM ---------------- */

const CartProdctComponent = ({
  product,
  onRemove,
  onQuantityChange,
  isExpanded,
  onToggle,
  notifyError
}) => {
  const price = Number(product.price) || 0;
  const quantity = Number(product.quantity) || 0;

  const unitPrice = price.toFixed(2);
  const totalPrice = (price * quantity).toFixed(2);

  const [qty, setQty] = useState(quantity);
  useEffect(() => {
    setQty(quantity);
  }, [quantity]);

  const onUpdateHandler = () => {
    onQuantityChange(product.id, qty);
    onToggle();
  };

  return (
    <>
      <div className="cart-product w-full p-2 flex justify-between items-center">
        <div className="product-detail flex gap-2 items-center">
          {/* <img src={keyup} alt="arrow-down" onClick={()=> setIsChnage(false)}/> */}
          {product.categoryName === "Butchery" ? (
            <span className="w-6"></span>
          ) : (
            <img src={isExpanded ? keyup : arrowDownIcon} alt="arrow-down" onClick={onToggle} />
          )
          }
          {product.img ? (
            <img
              className="w-14 h-14 object-cover rounded"
              src={product.img}
              alt={product.name}
            />
          ) : (
            <img
              className="w-14 h-14 object-cover rounded"
              src={defaultImg}
              alt={defaultImg}
            />
          )}
          <div className="product_heading">
            <h2 className="text-base font-semibold text-gray-600">{product.name}</h2>
            <h3 className="text-sm text-gray-500 font-semibold">{unitPrice} × {product.quantity} {product.categoryName === "Butchery" ? "kg" : product.unit}</h3>
          </div>
        </div>
        <div className="product-amount flex items-center gap-4">
          <h2 className="text-gray-500 font-semibold flex items-baseline gap-1">{totalPrice} <p className="text-xs">(exc.tax)</p></h2>
          <div className="delete-btn cursor-pointer" onClick={onRemove}>
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
          </div>
        </div>
      </div>
      {isExpanded && product.categoryName !== "Butchery" &&
        <div className="flex justify-between gap-4 items-end px-2">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-semibold text-[#555555]">Quantity</p>
            <div className="flex w-full h-10 items-center justify-between bg-white overflow-hidden  border border-gray-200">
              <div
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 pb-0.5 h-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-b from-secondary to-primary cursor-pointer"
              >
                -
              </div>
              {/* <span className="flex-1 text-center  text-sm">{qty}</span> */}
              <span><input type="number" value={qty} onChange={(e) => e.target.value > product.stock + product.stockQueue ? notifyError(<>Only <span style={{ color: "red" }}>{product.stock + product.stockQueue}</span> items available in<br />stock for {product.name}</>) : setQty(e.target.value)} className="w-14 h-full text-center text-sm outline-none" /></span>
              <div
                onClick={() => {
                  if (qty >= product.stock + product.stockQueue) {
                    notifyError(<>
                      Only <span style={{ color: "red" }}>{product.stock + product.stockQueue}</span> items available in
                      <br />
                      stock for {product.name}
                    </>);;
                    return;
                  }
                  setQty(qty + 1);
                }}
                className="w-10 h-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-b from-secondary to-primary cursor-pointer"
              >
                +
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-semibold text-[#555555]">Discount (%)</p>
            <div className="h-10 flex items-center px-3 shadow-[0_0_3px_#00000028] text-sm">
              {product.discount ? product.discount : "0.00"}
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-semibold text-[#555555] ">Price Per Unit</p>
            <div className="h-10 flex items-center px-3 shadow-[0_0_2px_#00000026] text-sm">
              {product.price}
            </div>
          </div>

          {/* Update Button */}
          <button className="h-10 px-6 text-sm rounded-md text-white font-bold  bg-gradient-to-b from-secondary to-primary"
            onClick={onUpdateHandler}
          >
            Update
          </button>
        </div>
      }
    </>
  );
};

/* ---------------- CART ---------------- */

const Cart = ({ onHoldOrder, setPayToProceed, subtotal, tax, discount, total, setIsRetail, isRetail }) => {
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotification();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [activeModal, setActiveModal] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0.00);
  const [waiterName, setWaiterName] = useState("");

  const {
    cartData,
    removeFromCart,
    updateQuantity,
    resetCart,
    selectedCustomer,
    selectedTable,
  } = useCartStore();
  const user = useAuthStore((u) => u.user);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };
  const closeModal = () => {
    setActiveModal(null);
  };
 // const [expandedId, setExpandedId] = useState(null);
 const { createHoldOrder } = useHoldOrderStore();

  const cartEndRef = useRef(null);

  const totalItems = cartData.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0
  );
  const [expandedProductId, setExpandedProductId] = useState(null);

  const handleToggleExpand = (id) => {
    setExpandedProductId(prev => (prev === id ? null : id));
  };
  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cartData]);

  const handleProceed = () => {
    if (totalItems === 0) {
      notifyError("Please add items in the cart");
      return;
    }
    setPayToProceed(true);
  };
  const handleLoginChange = (e) => {
    const { placeholder, value } = e.target;
    const field = e.target.name;
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const managerLoginHandler = () => {
    if (!loginData.username || !loginData.password) {
      notifyError("Username and Password is required");
      return;
    } else {
      closeModal();
      setShowDiscount(true);
      setLoginData({ username: '', password: '' })
      notifySuccess("Manager loged In")
    }
  }
  const saveDiscountHandler = () => {
    const discountData = {
      discountType,
      value: discountValue
    }
    console.log(discountData);
    setShowDiscount(false);

  }
const handleHoldOrder = async () => {
  if (!cartData.length) {
    notifyError("Cart is empty");
    return;
  }

  if (!waiterName.trim()) {
    notifyError("Waiter name is required");
    return;
  }

  const holdOrderPayload = {
    localId: `HOLD-${Date.now()}`,
    timestamp: Date.now(),
    note: waiterName,
    isSynced: false,
    serverId: null,
    cartData: {
      customer: selectedCustomer,
      table: selectedTable,
      orderItems: cartData,
      subtotal,
      taxAmount: tax,
      discount: {
        type: "FIXED",
        value: discount,
      },
      totalAmountToPay: total,
    },
  };

  try {
    await createHoldOrder(holdOrderPayload);
    resetCart();
    setWaiterName(waiterName);
    closeModal();
    notifySuccess("Order placed on hold");
  } catch (err) {
    notifyError("Failed to hold order");
  }
};

  return (
    <div className="h-screen border-l border-gray-200">
      <div className="cart-header flex items-center justify-between p-4 border-b border-gray-200">
        <div className="icons flex gap-2 fill-gray-600">
          <div className="cart-icons p-2 border border-gray-300 rounded-md cursor-pointer" onClick={() => setIsRetail(true)}>
            <svg
              viewBox="0 0 1024 1024"
              focusable="false"
              data-icon="shopping-cart"
              width="24"
              height="24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M922.9 701.9H327.4l29.9-60.9 496.8-.9c16.8 0 31.2-12 34.2-28.6l68.8-385.1c1.8-10.1-.9-20.5-7.5-28.4a34.99 34.99 0 00-26.6-12.5l-632-2.1-5.4-25.4c-3.4-16.2-18-28-34.6-28H96.5a35.3 35.3 0 100 70.6h125.9L246 312.8l58.1 281.3-74.8 122.1a34.96 34.96 0 00-3 36.8c6 11.9 18.1 19.4 31.5 19.4h62.8a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7h161.1a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7H923c19.4 0 35.3-15.8 35.3-35.3a35.42 35.42 0 00-35.4-35.2zM305.7 253l575.8 1.9-56.4 315.8-452.3.8L305.7 253zm96.9 612.7c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6zm325.1 0c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6z"></path>
            </svg>
          </div>
          <div className="reset-icons p-2 border border-gray-300 rounded-md cursor-pointer" onClick={resetCart}>
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="redo"
              width="24"
              height="24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M758.2 839.1C851.8 765.9 912 651.9 912 523.9 912 303 733.5 124.3 512.6 124 291.4 123.7 112 302.8 112 523.9c0 125.2 57.5 236.9 147.6 310.2 3.5 2.8 8.6 2.2 11.4-1.3l39.4-50.5c2.7-3.4 2.1-8.3-1.2-11.1-8.1-6.6-15.9-13.7-23.4-21.2a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-9.3 9.3-19.1 18-29.3 26L668.2 724a8 8 0 00-14.1 3l-39.6 162.2c-1.2 5 2.6 9.9 7.7 9.9l167 .8c6.7 0 10.5-7.7 6.3-12.9l-37.3-47.9z"></path>
            </svg>
          </div>
        </div>
        <div className="buttons flex gap-1">
          <button
            onClick={() => navigate("/pos/customers")}
            className="select-customer cursor-pointer bg-linear-to-b justify-center from-secondary to bg-primary text-white px-4 py-2 rounded mr-2 flex items-center gap-2 w-[180px]"
          >
            <p>{selectedCustomer?.firstName ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "Select Customer"}</p>
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="edit"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z"></path>
            </svg>
          </button>
          <button onClick={() => navigate("/pos/tables")} className="select-table cursor-pointer bg-pos-green text-white px-4 py-2 rounded flex gap-2 items-center w-[180px] justify-center">
            <svg
              className="w-6"
              fill="currentColor"
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
            <p>{selectedTable?.tableNumber ? `Table ${selectedTable.tableNumber}` : "Select Table"}</p>
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="edit"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="cart-container">
        {/* Cart items will be rendered here */}
        <div className="cart-products p-2 h-[calc(100vh-380px)] overflow-y-auto no-scrollbar">
          {cartData?.length > 0 ? (
            cartData?.map((p, index) => (
              <div
                key={p.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <CartProdctComponent
                  product={p}
                  isExpanded={expandedProductId === p.id}
                  onToggle={() => handleToggleExpand(p.id)}
                  onRemove={() => removeFromCart(p.id)}
                  onQuantityChange={updateQuantity}
                  notifyError={notifyError}
                />
                <div ref={cartEndRef} />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-700">No Products in Cart</p>
          )}
        </div>
        <div className="cart-details border-t-1 border-gray-200 p-4">
          {/* Cart details like subtotal, tax, total will be shown here */}
          <div className="cart-summary flex flex-col gap-2 text-gray-600 text-sm">
            <div className="subtotal flex justify-between ">
              <span>Subtotal</span>
              <span>P{subtotal.toFixed(2)}</span>
            </div>
            <div className="subtotal flex justify-between ">
              <span>Tax</span>
              <span>P{tax.toFixed(2)}</span>
            </div>
            <div className="subtotal flex justify-between ">
              <span>Discount</span>
              <span>P{discount.toFixed(2)}</span>
            </div>
          </div>
          <div className="cart-btns mt-4 flex gap-2">
            <div onClick={() => openModal('discount')} className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer">
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="percentage"
                width="24"
                height="24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M855.7 210.8l-42.4-42.4a8.03 8.03 0 00-11.3 0L168.3 801.9a8.03 8.03 0 000 11.3l42.4 42.4c3.1 3.1 8.2 3.1 11.3 0L855.6 222c3.2-3 3.2-8.1.1-11.2zM304 448c79.4 0 144-64.6 144-144s-64.6-144-144-144-144 64.6-144 144 64.6 144 144 144zm0-216c39.7 0 72 32.3 72 72s-32.3 72-72 72-72-32.3-72-72 32.3-72 72-72zm416 344c-79.4 0-144 64.6-144 144s64.6 144 144 144 144-64.6 144-144-64.6-144-144-144zm0 216c-39.7 0-72-32.3-72-72s32.3-72 72-72 72 32.3 72 72-32.3 72-72 72z"></path>
              </svg>
              <p>Discount</p>
            </div>
            <div onClick={() => navigate("/pos/invoices")} className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer">
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="swap"
                width="24"
                height="24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path>
              </svg>
              <p>Exchange</p>
            </div>
            <div onClick={() => openModal('holdOrder')} className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer">
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="pause"
                width="24"
                height="24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z"></path>
              </svg>
              <p>Hold Order</p>
            </div>
            {activeModal === 'discount' && (
              <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                  <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Store Manager Login</h2>
                  <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Enter store manager username" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm" />
                  <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter store manager password" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm" />
                  <div className="flex justify-between gap-2 text-[#555555]">
                    <button onClick={managerLoginHandler} className=" flex-1 px-4 py-2 bg-primary text-white rounded">Login</button>
                    <button onClick={closeModal} className=" flex-1 px-4 py-2 rounded text-sm font-bold shadow-[0_0_3px_#00000028]">X Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Hold Order Popup */}
            {showDiscount && (
              <div onClick={() => setShowDiscount(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                  <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Apply Discount</h2>
                  <div className="text-center text-lg font-semibold text-[#555555] py-4 space-y-2 my-6 rounded-md">
                    <p>Select Discount Type</p>
                    <div className="flex justify-center gap-2 text-sm text-white font-light">
                      <div onClick={() => setDiscountType("fixed")} className={`cursor-pointer py-2.5 px-4 rounded-md ${discountType == "fixed" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Fixed</div>
                      <div onClick={() => setDiscountType("percentage")} className={`cursor-pointer py-2.5 px-4 rounded-md ${discountType == "percentage" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Percentage</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder={discountType == "percentage" ? "Enter Discount Percentage" : "Enter Discount value"}
                    onChange={(e) => { setDiscountValue(e.target.value) }}
                    className="shadow-[0_0_3px_#00000028] w-full mb-6 p-3  font-light rounded-md placeholder:text-sm outline-none text-sm"
                  />
                  <div className="flex justify-between gap-4">
                    <button onClick={saveDiscountHandler} className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                    <button onClick={() => setShowDiscount(false)} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {activeModal === 'holdOrder' && (
              <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                  <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Hold Order</h2>
                  <input
                    type="text"
                    placeholder="Enter Waiter's Name"
                    onChange={(e) => { setWaiterName(e.target.value) }}
                    className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm"
                  />
                  <div className="flex justify-between gap-4">
                    <button onClick={handleHoldOrder} className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                    <button onClick={closeModal} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div onClick={() => user?.role?.name === "manager" ? "" : handleProceed()} className={`${user?.role?.name === "manager" ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} cart-checkout flex justify-between items-center bg-linear-to-b from-primary to-secondary text-white p-4 mt-4 rounded-lg `}>
            <div className="proceed">
              <h3 className="text-xl font-semibold">Proceed to Pay</h3>
              <h4 className="text-sm">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</h4>
            </div>
            <div className="proceed flex gap-2 items-center">
              <div className="price text-xl font-semibold">P{total.toFixed(2)}</div>
              <div className="icon">
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="double-right"
                  width="32"
                  height="32"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1A7.98 7.98 0 00188 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5zm304 0L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1A7.98 7.98 0 00492 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
