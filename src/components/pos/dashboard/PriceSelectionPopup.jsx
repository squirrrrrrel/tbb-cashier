import React, { useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useNotification } from "../../../hooks/useNotification";
const PriceSelectionPopup = ({ product, selectPriceFor, setSelectPriceFor }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const isShots = selectPriceFor?.toLowerCase() === "shots";
  const { notifyError } = useNotification();

  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shots, setShots] = useState("");
  const [mlQuantity, setMlQuantity] = useState("");

  const unitPrice = Number(product?.price || 0);
  const quantityValue = isShots ? Number(mlQuantity || 0) : unit === "kg" ? Number(quantity || 0) : Number(quantity || 0) / 1000;
  const totalPrice = isShots
    ? Number(quantityValue || 0) * unitPrice
    : Number(quantityValue || 0) * unitPrice;


  const handleAdd = () => {
    if (!product) return;

    // SHOTS FLOW
    if (isShots) {
      if (!shots || !mlQuantity) return;

      addToCart({
        ...product,
        unit: "ml",
        quantity: Number(mlQuantity),
        shots: Number(shots),
        totalPrice: Number(totalPrice)
      });
    }
    // BUTCHERY FLOW
    else {
      if (!unit || !quantity) return;
      const result = addToCart({
        ...product,
        unit,
        quantity: Number(quantityValue),
        totalPrice: Number(totalPrice)
      });

      if (result.success === false && result.reason === "OUT_OF_STOCK") {
        notifyError(<>
          Only <span style={{ color: "red" }}>{product.stock + product.stockQueue} {product.unit}</span> items available in
          <br /> stock for {product.name}
        </>);
        return;
      }
    }

    // Close popup after add
    setSelectPriceFor("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setSelectPriceFor("")}>
      <div className="bg-white rounded-md shadow-2xl w-[450px] py-5 px-6 animate-scale-in" onClick={e => e.stopPropagation()}>

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
            <div className="flex gap-4">

              {/* QUANTITY */}
              <div className="w-full">
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
              <div className="w-full">
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

            </div>
          )}

          {/* TOTAL VALUE (READ ONLY) */}
          <div>
            <label className="font-medium">Total Price</label>
            <input
              type="text"
              readOnly
              value={`${totalPrice.toFixed(2)}`}
              className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026]  outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6 text-sm">
          <button className="flex-1 py-2 font-bold text-white bg-gradient-to-b from-secondary to-primary rounded-md" onClick={handleAdd}>
            + ADD
          </button>

          <button className=" text-[#555555] flex-1 py-2 font-bold rounded-md flex gap-1 justify-center shadow-[0_0_3px_#00000026]" onClick={() => setSelectPriceFor("")}>
            <p className="font-light">X</p> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSelectionPopup;
