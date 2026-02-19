import React, { useState, useEffect } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useNotification } from "../../../hooks/useNotification";

const PriceSelectionPopup = ({ product, selectPriceFor, setSelectPriceFor, shotsvolumeml }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const isShots = selectPriceFor?.toLowerCase() === "shots";
  const { notifyError } = useNotification();

  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shots, setShots] = useState("");
  const [mlQuantity, setMlQuantity] = useState("");
  const [displayPrice, setDisplayPrice] = useState(""); 

  const unitPrice = Number(product?.price || 0);

  // Auto-fill for shots volume
  useEffect(() => {
    if (isShots && product?.isautoFill && shotsvolumeml) {
      setMlQuantity(parseFloat(shotsvolumeml).toFixed(2));
    }
  }, [product?.isautoFill, shotsvolumeml, isShots]);

  // Helper to calculate weight for store submission
  const getWeightInKg = (u, q) => {
    if (u === "kg") return Number(q || 0);
    return Number(q || 0) / 1000;
  };

  // --- HANDLERS ---

  // 1. When Quantity changes (Butchery)
  const handleQuantityChange = (val) => {
    setQuantity(val);
    if (unit && unitPrice) {
      const weight = unit === "kg" ? Number(val) : Number(val) / 1000;
      setDisplayPrice((weight * unitPrice).toFixed(2));
    }
  };

  // 2. When Unit changes (Butchery)
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (quantity && unitPrice) {
      const weight = newUnit === "kg" ? Number(quantity) : Number(quantity) / 1000;
      setDisplayPrice((weight * unitPrice).toFixed(2));
    }
  };

  // 3. When Price changes (Butchery ONLY - Reverse Calculation)
  const handlePriceChange = (e) => {
    const enteredPrice = e.target.value;
    setDisplayPrice(enteredPrice); // Let the user type freely

    if (!isShots && unitPrice > 0 && enteredPrice !== "") {
      const totalWeightInKg = Number(enteredPrice) / unitPrice;
      
      if (totalWeightInKg >= 1) {
        setUnit("kg");
        setQuantity(totalWeightInKg.toFixed(3));
      } else {
        setUnit("gm");
        setQuantity((totalWeightInKg * 1000).toFixed(0));
      }
    }
  };

  // 4. Shots specific price calculation
  const shotsTotalPrice = isShots 
    ? (Number(mlQuantity || 0) * Number(shots || 0) * unitPrice).toFixed(2)
    : displayPrice;

  const handleAdd = () => {
    if (!product) return;

    if (isShots) {
      if (!shots || !mlQuantity) return;
      addToCart({
        ...product,
        unit: "ml",
        quantity: Number(mlQuantity),
        shots: Number(shots),
        totalPrice: Number(shotsTotalPrice)
      });
    } else {
      if (!unit || !quantity) {
        notifyError("Please enter quantity and unit");
        return;
      }
      const result = addToCart({
        ...product,
        unit,
        quantity: getWeightInKg(unit, quantity),
        totalPrice: Number(displayPrice)
      });

      if (result?.success === false && result.reason === "OUT_OF_STOCK") {
        notifyError(<>
          Only <span style={{ color: "red" }}>{product.stock + product.stockQueue} {product.unit}</span> items available.
        </>);
        return;
      }
    }
    setSelectPriceFor("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setSelectPriceFor("")}>
      <div className="bg-white rounded-md shadow-2xl w-[450px] py-5 px-6" onClick={e => e.stopPropagation()}>
        
        <div className="text-center mb-4 text-[#555555]">
          <h2 className="text-2xl font-bold">{isShots ? "Custom Shots Details" : "Butchery Products Details"}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          {/* Product Name */}
          <div>
            <label className="font-medium">Product Name</label>
            <input type="text" value={product?.name || ""} readOnly className="w-full mt-1 rounded-md px-3 py-2 bg-gray-50 shadow-[0_0_3px_#00000026] outline-none" />
          </div>

          {isShots ? (
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="font-medium">Shots</label>
                <input type="number" value={shots} onChange={(e) => setShots(e.target.value)} className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none" />
              </div>
              <div className="w-full">
                <label className="font-medium">Quantity (ml)</label>
                <input disabled={product?.isautoFill} type="number" value={mlQuantity} onChange={(e) => setMlQuantity(e.target.value)} className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none" />
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-full">
                <label className="font-medium">Quantity</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none"
                />
              </div>
              <div className="w-full">
                <label className="font-medium">Unit</label>
                <select value={unit} onChange={(e) => handleUnitChange(e.target.value)} className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none">
                  <option value="">Select</option>
                  <option value="kg">kg</option>
                  <option value="gm">gm</option>
                </select>
              </div>
            </div>
          )}

          {/* Total Price Field */}
          <div>
            <label className="font-medium">Total Price</label>
            <input
              type="number"
              value={isShots ? shotsTotalPrice : displayPrice}
              onChange={handlePriceChange}
              readOnly={isShots} // SHOTS = READONLY, BUTCHERY = EDITABLE
              placeholder="0.00"
              className={`w-full mt-1 rounded-md px-3 py-2 outline-none shadow-[0_0_3px_#00000026] ${isShots ? '' : 'bg-white focus:ring-1 ring-primary'}`}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6 text-sm">
          <button className="flex-1 py-2 font-bold text-white bg-gradient-to-b from-secondary to-primary rounded-md" onClick={handleAdd}>+ ADD</button>
          <button className="text-[#555555] flex-1 py-2 font-bold rounded-md shadow-[0_0_3px_#00000026]" onClick={() => setSelectPriceFor("")}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PriceSelectionPopup;