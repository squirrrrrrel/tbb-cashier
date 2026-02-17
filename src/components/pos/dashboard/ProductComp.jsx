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
  barcode,
  stockQueue,
  categoryName,
  setCartProducts,
  discount,
  tax,
  mute,
  originalPrice,
  lowStockThreshold,
  isautoFill,
  shotsvolumeml,
  shotsperbottel,
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
        tax,
        barcode,
        stockQueue,
        categoryName,
        discount,
        isautoFill,
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
      tax,
      stock,
      barcode,
      stockQueue,
      discount,
    });

    if (result?.success === false) {
      if (result.reason === "OUT_OF_STOCK") {
        notifyError(<>
          Only <span style={{ color: "white" }}>{stock + stockQueue}</span> items available in
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
    <div onClick={handleAddToCart} className="product bg-white border border-gray-300 rounded-lg w-36 h-[290px] hover:border-secondary cursor-pointer">
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
      <div className="product-details p-3 flex h-[140px] items-center">
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
              P{parseFloat(price).toFixed(2)} / {unit === "ml" ? isautoFill ? "per shot" : unit : unit}
            </span>
          ) : (
            <span className="text-sm text-secondary flex flex-col justify-center gap-1">
              <span className="line-through">
                P{parseFloat(originalPrice).toFixed(2)} / {isautoFill ? "shot" : unit}
              </span>
              <span>
                P{parseFloat(price).toFixed(2)} / {isautoFill ? "shot" : unit}
              </span>
              {/* <span>
                / {isautoFill ? "shot" : unit}
              </span> */}
            </span>
          )}
          <span className="text-xs text-pos-green">
            In Stock {unit === "ml" ? isautoFill ? `(${parseFloat(shotsperbottel).toFixed(2)} shots)` : `(${stock} ${unit})`: `(${stock} ${unit})`}
          </span>
          <span className="text-xs text-gray-700">
            + Stock ({stockQueue} {unit})
          </span>
        </div>
      </div>
      {lowStockThreshold >= stock && (
        <div className="relative">
          {/* Local Styles for this component only */}
          <style>
            {`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}
          </style>

          <div
            className="low-stock-badge text-xs py-px px-2 absolute text-[#ff0000]"
            style={{
              right: 8,
              bottom: 8,
              position: "absolute",
              animation: "fadeInOut 1.5s ease-in-out infinite",
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
          shotsvolumeml={shotsvolumeml}
        />
      )}
    </div>
  );
};

export default ProductComp;
