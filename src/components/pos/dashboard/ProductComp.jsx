import React from "react";
import { useCartStore } from "../../../store/useCartStore";
import defaultImg from "./../../../assets/images/Default_Product_Img.png";
import { useNotification } from "../../../hooks/useNotification";
import PriceSelectionPopup from "../dashboard/PriceSelectionPopup.jsx";
import { useState } from "react";

const { notifyError } = useNotification();
const ProductComp = ({
  id,
  img,
  name,
  price,
  unit,
  stock,
  stockQueue,
  isLowStock,
  categoryName,
  setCartProducts,
  mute,
  originalPrice
}) => {
  const playBeepSound = () => {
    const audio = new Audio("/sounds/add-to-cart.mp3");
    audio.volume = 1;
    if (!mute) {
      audio.play().catch((error) => {
        console.warn("Error playing sound:", error);
      });
    } else {
      console.warn("Sound is on mute");
    }
  };
  const [selectPriceFor, setSelectPriceFor] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = () => {
    // Butchery or Shots → open popup
    if (
      categoryName?.toLowerCase() === "butchery" ||
      name.toLowerCase().includes("shots")
    ) {
      setSelectedProduct({
        id,
        img,
        name,
        price,
        unit: name.toLowerCase().includes("shots") ? "ml" : unit,
        stock,
        stockQueue,
        categoryName
      });

      setSelectPriceFor(
        name.toLowerCase().includes("shots") ? "shots" : "butchery"
      );
      return;
    }

    // Other products → directly add
    addDirectlyToCart();
  };

  const addDirectlyToCart = () => {
    if (name.toLowerCase().includes("shots")) {
      setIsShots(true);
    }
    const result = useCartStore.getState().addToCart({
      id,
      img,
      name,
      price,
      unit,
      stock,
      stockQueue
    });

    if (result?.success === false) {
      if (result.reason === "OUT_OF_STOCK") {
        notifyError(<>
          Only <span style={{ color: "red" }}>{stock + stockQueue}</span> items available in
          <br />
          stock for {name}
        </>);
      }
      playBeepSound();
      return;
    }

    playBeepSound();
  };

  return (
    <div onClick={handleAddToCart} className="product bg-white border border-gray-300 rounded-lg w-36 h-[270px] hover:border-secondary cursor-pointer">
      {img ? (
        <img
          src={img}
          alt={defaultImg}
          style={{
            width: "144px",
            height: "144px",
            objectFit: "cover",
          }}
          className="rounded-t-lg border-b border-b-gray-300"
        />
      ) : (
        <img
          src={defaultImg}
          alt={defaultImg}
          style={{
            width: "144px",
            height: "144px",
            objectFit: "cover",
          }}
          className="rounded-t-lg border-b border-b-gray-300"
        />
      )}
      <div className="product-details p-3 flex h-[120px] items-center">
        <div className="flex flex-col gap-1 font-semibold">
          <h2
            className="text-sm text-gray-700"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
            title={name}
          >
            {name}
          </h2>
          {price === originalPrice ? (
            <span className="text-sm text-secondary">
              P{price} / {unit}
            </span>
          ) : (
            <span className="text-sm text-secondary flex items-center gap-1">
              <span className="line-through text-gray-400">
                P{originalPrice}
              </span>
              <span>
                P{price}
              </span>
              <span>
                / {unit}
              </span>
            </span>
          )}
          <span className="text-xs text-pos-green">
            In Stock ({stock} {unit})
          </span>
          <span className="text-xs text-gray-700">
            + Stock ({stockQueue} {unit})
          </span>
        </div>
      </div>
      {isLowStock && (
        <div className="relative">
          <div
            className="low-stock-badge text-xs rounded-full py-px px-2 absolute text-red-700 font-semibold"
            style={{
              right: 8,
              bottom: 8,
              position: "absolute",
              animation: "pulse 1s infinite",
              opacity: 0 // ensure min opacity for better fade
            }}
          >
            Low
          </div>
        </div>
      )}

      {selectPriceFor && selectedProduct && (
        <PriceSelectionPopup
          product={selectedProduct}
          selectPriceFor={selectPriceFor}
          setSelectPriceFor={setSelectPriceFor}
        />
      )}
    </div>
  );
};

export default ProductComp;
