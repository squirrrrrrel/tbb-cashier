"use client";
import React, { useState } from "react";
import arrowDownIcon from "../../../assets/icons/arrow_down.svg";

const CartProdctComponent = () => {
  return (
    <div className="cart-product w-full odd:bg-gray-50 p-2 flex justify-between items-center">
      <div className="product-detail flex gap-2 items-center">
        <img src={arrowDownIcon} alt="arrow-down" />
        <img
          className="w-14"
          src="https://png.pngtree.com/png-vector/20250303/ourmid/pngtree-ripe-mango-fruit-with-leaf-for-healthy-snack-png-image_15699037.png"
        />
        <div className="product_heading">
          <h2 className="text-base font-semibold text-gray-600">Product 1</h2>
          <h3 className="text-sm text-gray-400 font-semibold">30.00 × 1pcs</h3>
        </div>
      </div>
      <div className="product-amount flex items-center gap-4">
        <h2 className="text-gray-700 font-semibold">30.00 (exc.tax)</h2>
        <div className="delete-btn">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="delete"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cartProducts, setCartProducts] = useState([
    // Sample cart products can be added here
    {
      id: 1,
      name: "Product 1",
      price: 100,
      quantity: 1,
      imgUrl:
        "https://png.pngtree.com/png-vector/20250303/ourmid/pngtree-ripe-mango-fruit-with-leaf-for-healthy-snack-png-image_15699037.png",
    },
    {
      id: 2,
      name: "Product 2",
      price: 200,
      quantity: 1,
      imgUrl:
        "https://png.pngtree.com/png-vector/20250303/ourmid/pngtree-ripe-mango-fruit-with-leaf-for-healthy-snack-png-image_15699037.png",
    },
    {
      id: 3,
      name: "Product 3",
      price: 300,
      quantity: 1,
      imgUrl:
        "https://png.pngtree.com/png-vector/20250303/ourmid/pngtree-ripe-mango-fruit-with-leaf-for-healthy-snack-png-image_15699037.png",
    },
  ]);
  return (
    <div className="h-screen border-l-1 border-gray-200">
      <div className="cart-header flex items-center justify-between p-4 border-b-1 border-gray-200">
        <div className="icons flex gap-2 fill-gray-600">
          <div className="cart-icons p-2 border-1 border-gray-300 rounded-md">
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
          <div className="reset-icons p-2 border-1 border-gray-300 rounded-md">
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
          <button className="clear-cart bg-gradient-to-b from-secondary to bg-primary text-white px-4 py-2 rounded mr-2 flex items-center gap-2">
            <p>Select Customer</p>
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
          <button className="checkout bg-green-500 text-white px-4 py-2 rounded flex gap-2 items-center">
            <p>Select Table</p>
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
          </button>
        </div>
      </div>
      <div className="cart-container">
        {/* Cart items will be rendered here */}
        <div className="cart-products p-2 h-[calc(100vh-380px)]">
          {cartProducts.length > 0 ? (
            cartProducts.map((p) => <CartProdctComponent key={p.id} />)
          ) : (
            <p className="text-sm">No Products in Cart</p>
          )}
        </div>
        <div className="cart-details border-t-1 border-gray-200 p-4">
          {/* Cart details like subtotal, tax, total will be shown here */}
          <div className="cart-summary flex flex-col gap-2 text-gray-600 text-sm">
            <div className="subtotal flex justify-between ">
              <span>Subtotal</span>
              <span>P0.00</span>
            </div>
            <div className="subtotal flex justify-between ">
              <span>Tax</span>
              <span>P0.00</span>
            </div>
            <div className="subtotal flex justify-between ">
              <span>Discount</span>
              <span>P0.00</span>
            </div>
          </div>
          <div className="cart-btns mt-4 flex gap-2">
            <div className="discount w-full bg-gray-100 p-4 fill-gray-700 text-gray-700 rounded-lg">
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
            <div className="discount w-full bg-gray-100 p-4 fill-gray-700 text-gray-700 rounded-lg">
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
            <div className="discount w-full bg-gray-100 p-4 fill-gray-700 text-gray-700 rounded-lg">
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
          </div>
          <div className="cart-checkout flex justify-between items-center bg-gradient-to-b from-primary to-secondary text-white p-4 mt-4 rounded-lg">
            <div className="proceed">
              <h3 className="text-xl font-semibold">Proceed to Pay</h3>
              <h4 className="text-sm">0 Item</h4>
            </div>
            <div className="proceed flex gap-2 items-center">
              <div className="price text-xl font-semibold">P0.00</div>
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
