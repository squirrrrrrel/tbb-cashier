import React, { useState } from "react";
import allProductsImage from "../../../assets/images/all-product.png";
import shotsImage from "../../../assets/images/shots.png";
import butcheryImage from "../../../assets/images/butchery.png";
import fullScreenIcon from "../../../assets/icons/full-screen.svg";
import exitFullScreenIcon from "../../../assets/icons/close-full-screen.svg";
import speakerIcon from "../../../assets/icons/speaker.svg";
import muteIcon from "../../../assets/icons/mute.svg";

const category = [
  {
    id: 1,
    name: "All Products",
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

const ProductCategoryComp = ({ category }) => {
  return (
    <div className="p-2 bg-transparent rounded-2xl border-1 border-gray-200 hover:outline-2 hover:outline-primary cursor-pointer flex items-center">
      <img src={category.image} alt={category.name} className="w-14" />
    </div>
  );
};

const Header = () => {
  const [isFullScreen, setIsFullScreen] = useState(
    !!document.fullscreenElement
  );
  const [isMuted, setIsMuted] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="header">
      <div className="p-4 flex gap-20 items-center">
        <div className="logo bg-secondary text-white px-6 py-4 text-2xl rounded-2xl font-bold">
          warnoc
        </div>
        <div className="product-categories flex gap-4">
          {category.map((cat) => (
            <ProductCategoryComp key={cat.id} category={cat} />
          ))}
        </div>
      </div>
      <div className="search-button-group px-4 flex gap-4 items-center">
        <div className="search relative w-2/3">
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
            className="p-2 pl-10 border border-gray-200 bg-white rounded-md w-full shadow-sm outline-0 cursor-text"
          />
        </div>
        <div className="button-group flex gap-2">
          <div className="reset-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer shadow-sm">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 3h6a4.5 4.5 0 010 9H9v9H7V3zm2 2v5h4a2.5 2.5 0 000-5H9z" />
            </svg>
          </div>
          <div
            onClick={toggleFullscreen}
            className="full-screen-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer shadow-sm"
          >
            <img
              src={isFullScreen ? exitFullScreenIcon : fullScreenIcon}
              alt="Full Screen"
            />
          </div>
          <div
            onClick={() => setIsMuted(!isMuted)}
            className="reset-icons p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer shadow-sm"
          >
            <img src={isMuted ? muteIcon : speakerIcon} alt="Speaker" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
