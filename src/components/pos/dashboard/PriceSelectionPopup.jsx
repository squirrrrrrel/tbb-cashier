import React, { useState } from "react";

const PriceSelectionPopup = ({ product, selectPriceFor, setSelectPriceFor }) => {
  const isShots = selectPriceFor?.toLowerCase() === "shots";

  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shots, setShots] = useState("");
  const [mlQuantity, setMlQuantity] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={()=> setSelectPriceFor("")}>
      <div className="bg-white rounded-md shadow-2xl w-[450px] py-5 px-6 animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="text-center mb-4  text-[#555555]">
          <h2 className="text-2xl font-bold">
            {isShots ? "Custom Shots Details" : "Butchery Products Details"}
          </h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-4 text-sm">
          
          {/* Product Name */}
          <div>
            <label className="font-medium">Product Name</label>
            <input
              type="text"
              value={product?.name || ""}
              readOnly
              className="w-full mt-1 rounded-md px-3 py-2 bg-gray- shadow-[0_0_3px_#00000026]  outline-none"
            />
          </div>

          {/* SHOTS FLOW */}
          {isShots ? (
            <>
              <div>
                <label className="font-medium">Shots</label>
                <input
                  type="number"
                  placeholder="Enter No of Shots"
                  value={shots}
                  onChange={(e) => setShots(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none"
                />
              </div>

              <div>
                <label className="font-medium">Quantity</label>
                <input
                  type="number"
                  placeholder="Enter Quantity (ml)"
                  value={mlQuantity}
                  onChange={(e) => setMlQuantity(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none"
                />
              </div>
            </>
          ) : (
            <>
            
              {/* QUANTITY */}
              <div>
                <label className="font-medium">Quantity</label>
                <input
                  type="number"
                  placeholder={
                    unit ? `Enter quantity in ${unit}` : "Select unit first"
                  }
                  disabled={!unit}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 disabled:bg-gray-100 shadow-[0_0_3px_#00000026] outline-none"
                />
              </div>
              {/* UNIT DROPDOWN */}
              <div>
                <label className="font-medium">Select Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none"
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gm">Gram (gm)</option>
                </select>
              </div>

            </>
          )}

          {/* TOTAL VALUE (READ ONLY) */}
          <div>
            <label className="font-medium">Total Price</label>
            <input
              type="text"
              readOnly
              value=" 0.00"
              className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026]  outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6 text-sm">
          <button className="flex-1 py-2 font-bold text-white bg-gradient-to-b from-secondary to-primary rounded-md">
            + ADD
          </button>

          <button className=" text-[#555555] flex-1 py-2 font-bold rounded-md flex gap-1 justify-center shadow-[0_0_3px_#00000026]">
            <p className="font-light">X</p> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSelectionPopup;
