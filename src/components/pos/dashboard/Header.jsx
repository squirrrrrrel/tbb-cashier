import React, { useState, useEffect } from "react";
import allProductsImage from "../../../assets/images/all-product.png";
import shotsImage from "../../../assets/images/shots.png";
import butcheryImage from "../../../assets/images/butchery.png";
import qkartsLogo from "../../../assets/images/qkarts-logo.png";
import fullScreenIcon from "../../../assets/icons/full-screen.svg";
import exitFullScreenIcon from "../../../assets/icons/close-full-screen.svg";
import speakerIcon from "../../../assets/icons/speaker.svg";
import muteIcon from "../../../assets/icons/mute.svg";
import { useProductStore } from "../../../store/useProductStore";
const category = [
  {
    id: 1,
    name: "All",
    image: allProductsImage,
  },
  {
    id: 2,
    name: "Shots",
    image: shotsImage,
  },
  {
    id: 3,
    name: "Butchery",
    image: butcheryImage,
  },
];

const ProductCategoryComp = ({ category, filters, setFilters }) => {
  return (
    <div
      onClick={() =>
        setFilters((prev) => ({
          ...prev,
          category: category ? category.name : "all",
        }))
      }
      className={`p-2 bg-transparent rounded-2xl border border-gray-200 hover:outline-2 hover:outline-secondary cursor-pointer flex items-center ${filters.category.toLowerCase() === category.name.toLowerCase()
        ? "outline-2 outline-secondary"
        : ""
        }`}
    >
      <img src={category.image} alt={category.name} className="w-14" />
    </div>
  );
};

const Header = ({ filters, setFilters, productListLength, mute, setMute, scanToCart }) => {
  const [isTransferProductOpen, setIsTransferProductOpen] = useState(false);
  const [selectedTransferProduct, setSelectedTransferProduct] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(
    !!document.fullscreenElement
  );
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  const { products, ready, hydrate } = useProductStore();
  useEffect(() => {
    if (isTransferProductOpen && !ready) {
      hydrate();
    }
  }, [isTransferProductOpen, ready, hydrate]);

  const transferableProducts = products.filter(
    (p) => p.stock > 0
  );
  const handleTransfer = () => {
    if (!selectedTransferProduct) return;

    const product = products.find(
      (p) => p.serverId === selectedTransferProduct
    );

    console.log("Transfer product:", product);

    // 👉 call transfer API / logic here

    setIsTransferProductOpen(false);
  };


  return (
    <div className="header">
      <div className="p-4 flex gap-10 items-center">
        <div className="logo bg-white p-2 text-2xl rounded-md font-bold">
          <img src={qkartsLogo} className="w-36 object-cover" />
        </div>
        <div className="product-categories flex gap-4">
          {category.map((cat) => (
            <ProductCategoryComp
              key={cat.id}
              category={cat}
              filters={filters}
              setFilters={setFilters}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between px-4 items-center search-button-group gap-4 w-full">
        <div className="search-button-group flex gap-4 items-center w-full">
          <div className="search relative w-3/5">
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search By Product Name, Barcode Number"
              className="p-2 pl-10 border border-gray-200 bg-white rounded-md w-full outline-0 cursor-text"
              value={filters.product ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  product: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  scanToCart?.(e.target.value);
                }
              }}
            />
          </div>
          <div className="button-group flex gap-2">
            <div className="reset-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer ">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 3h6a4.5 4.5 0 010 9H9v9H7V3zm2 2v5h4a2.5 2.5 0 000-5H9z" />
              </svg>
            </div>
            {filters.category.toLowerCase() === "shots" &&
              <div onClick={() => setIsTransferProductOpen(true)} className="text-2xl p-1 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"><p className="px-2">T</p></div>
            }
            <div
              onClick={toggleFullscreen}
              className="full-screen-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
            >
              <img
                src={isFullScreen ? exitFullScreenIcon : fullScreenIcon}
                alt="Full Screen"
              />
            </div>
            <div
              onClick={() => setMute(!mute)}
              className="reset-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
            >
              <img src={mute ? muteIcon : speakerIcon} alt="Speaker" />
            </div>
          </div>
        </div>
        <div className="product-length w-20">
          <h2 className="text-sm">{productListLength} Results</h2>
        </div>
      </div>
      {isTransferProductOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setIsTransferProductOpen(false)}>
          <div className="bg-white rounded-md shadow-2xl w-[450px] py-5 px-6 animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6  text-[#555555] text-2xl font-bold">Transfer Product</div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="font-medium">Product Name</label>
                <select
                  value={selectedTransferProduct}
                  onChange={(e) => setSelectedTransferProduct(e.target.value)}
                  className="w-full mt-1 rounded-md px-3 py-2 shadow-[0_0_3px_#00000026] outline-none text-[#555555]"
                >
                  <option value="">Select Product</option>

                  {ready &&
                    transferableProducts.filter(product => product.categoryName === "Shots" && product.unit == "btl").map((product) => (
                      <option key={product.serverId} value={product.serverId}>
                        {product.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6 text-sm">
              <button
                disabled={!selectedTransferProduct}
                onClick={handleTransfer}
                className={`flex-1 py-2 font-bold text-white rounded-md bg-gradient-to-b from-secondary to-primary 
                ${!selectedTransferProduct
                    ? "opacity-70"
                    : "cursor-pointer"
                  }`}
              >
                Transfer
              </button>
              <button className=" text-[#555555] cursor-pointer flex-1 py-2 font-bold rounded-md flex gap-1 justify-center shadow-[0_0_3px_#00000026]" onClick={() => setIsTransferProductOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default Header;
