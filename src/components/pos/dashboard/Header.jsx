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
import { useRetail } from "../../../hooks/useRetail";
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

const Header = ({ filters, setFilters, productListLength, mute, setMute, scanToCart, isPettyClicked, setIsPettyClicked }) => {
  const [isTransferProductOpen, setIsTransferProductOpen] = useState(false);
  const [selectedTransferProduct, setSelectedTransferProduct] = useState("");
  const { setIsRetail, setIsRetailOpen } = useRetail();
  const [isFullScreen, setIsFullScreen] = useState(
    !!document.fullscreenElement
  );
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
  const handleFullscreenChange = () => {
    // Check if there is currently an element in fullscreen
    setIsFullScreen(!!document.fullscreenElement);
  };

  // Listen for the change event
  document.addEventListener('fullscreenchange', handleFullscreenChange);

  // Clean up the listener when the component unmounts
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  };
}, []);
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
      <div className="flex justify-between pl-4 items-center search-button-group gap-4 w-full">
        <div className="search-button-group flex gap-2 items-center w-full">
          <div className="search relative flex items-center flex-1 w-full min-w-0">
            <svg
              className="absolute left-3 top-3.5 w-4 text-gray-400"
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
              className="p-2 pl-10 border border-gray-200 bg-white rounded-md w-full outline-0 cursor-text placeholder:text-sm"
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
            <div onClick={() => setIsPettyClicked(true)} className="reset-icons border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer ">
              <p className="text-xl py-1.5 px-3.5">P</p>
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
            <div className="cart-icons text-[#555555] p-2 border border-gray-300 rounded-md bg-white cursor-pointer" onClick={() => { setIsRetail(true); setIsRetailOpen(true) }}>
              <svg
                viewBox="0 0 1024 1024"
                focusable="false"
                data-icon="shopping-cart"
                width="26"
                height="26"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M120 160H72c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zm833 0h-48c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zM200 736h112c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm321 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm126 0h178c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H647c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-255 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-79 64H201c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm257 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm256 0H648c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h178c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm-385 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="product-length w-20">
          <h2 className="text-sm">{productListLength} Results</h2>
        </div>
      </div>
      {isTransferProductOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setIsTransferProductOpen(false)}>
          <div className="bg-white rounded-md shadow-2xl w-[450px] py-5 px-6 animate-scale-in" onClick={e => e.stopPropagation()}>
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
