import React from "react";

const ProductComp = ({
  id,
  img,
  name,
  price,
  unit,
  stock,
  stockQueue,
  isLowStock,
  setCartProducts,
  mute
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

  const handleAddToCart = () => {
    setCartProducts((prev) => {
      // Check if product already exists in cart
      const existingProduct = prev.find((p) => p.id === id);
      if (existingProduct) {
        // If exists, increment quantity
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      // If not exists, add new product
      return [...prev, {
        id: id,
        imgUrl: img,
        name: name,
        price: parseFloat(price),
        quantity: 1,
      }];
    });
    playBeepSound()
  };

  return (
    <div onClick={handleAddToCart} className="product bg-white border border-gray-300 rounded-lg w-36 h-[270px] hover:border-secondary cursor-pointer">
      <img
        src={img}
        alt={name}
        style={{
          width: "144px",
          height: "144px",
          objectFit: "cover",
        }}
        className="rounded-t-lg border-b border-b-gray-300"
      />
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
          <span className="text-sm text-secondary">
            P{price} / {unit}
          </span>
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
            className="low-stock-badge text-[8px] bg-red-100 rounded-full py-px px-2 absolute animate-pulse text-red-600"
            style={{ right: 8, bottom: 8, position: "absolute" }}
          >
            Low
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComp;
