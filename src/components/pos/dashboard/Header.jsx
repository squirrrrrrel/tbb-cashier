import React, { useState, useEffect, useMemo } from "react";
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
import { transferProductAPI } from "../../../api/transferProductAPI";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNotification } from "../../../hooks/useNotification";
import { useCategoryStore } from "../../../store/useCategoryStore";
import Select from 'react-select';
import { commonSelectStyles } from "../../common/select/selectStyle";
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
  const imgUrl = category.img_url || category.category_name === "All" ? allProductsImage : category.category_name === "Shots" ? shotsImage : butcheryImage;
  return (
    <div
      onClick={() =>
        setFilters((prev) => ({
          ...prev,
          category: category ? category.category_name : "all",
        }))
      }
      className={`p-2  bg-transparent rounded-2xl border border-gray-200 hover:outline-2 hover:outline-secondary cursor-pointer flex items-center ${filters.category.toLowerCase() === category.category_name.toLowerCase()
        ? "outline-2 outline-secondary"
        : ""
        }`}
    >
      <img src={imgUrl} alt={category.category_name} className="w-14 h-14" fetchpriority="high" loading="eager" />
    </div>
  );
};

/* --- Helper for underlining shortcut letters --- */
const ShortcutLabel = ({ text, char }) => {
  const index = text.toLowerCase().indexOf(char.toLowerCase());
  if (index === -1) return <span>{text}</span>;
  return (
    <span>
      {text.substring(0, index)}
      <span className="underline decoration-1 underline-offset-2">{text[index]}</span>
      {text.substring(index + 1)}
    </span>
  );
};

const Header = ({ filters, setFilters, productListLength, mute, setMute, scanToCart, isPettyClicked, setIsPettyClicked }) => {
  const [isTransferProductOpen, setIsTransferProductOpen] = useState(false);
  const [selectedTransferProduct, setSelectedTransferProduct] = useState("");
  const { setIsRetail, setIsRetailOpen } = useRetail();
  const { notifyError, notifySuccess } = useNotification();
  const { hydrate: hydrateCategories, categories, hydrated: isCategoryHydrated } = useCategoryStore();
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
  const [isTransferring, setIsTransferring] = useState(false);
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
  const { products, ready, hydrate, fetchProductsFromAPI } = useProductStore();
  useEffect(() => {
    if (isTransferProductOpen && !ready) {
      hydrate();
    }
  }, [isTransferProductOpen, ready, hydrate]);

  useEffect(() => {
    hydrateCategories();
  }, [categories, isCategoryHydrated]);


  const transferableProducts = products.filter(
    (p) => p.stock > 0
  );
  const productOptions = useMemo(() => {
    return products
      .filter(product => product.stock > 0 && product.categoryName === "Shots" && product.unit === "btl")
      .map(product => ({
        value: product.serverId,
        label: product.name
      }));
  }, [products]);
  // const handleTransfer = () => {
  //   if (!selectedTransferProduct) return;

  //   const product = products.find(
  //     (p) => p.serverId === selectedTransferProduct
  //   );

  //   console.log("Transfer product:", product);

  //   // 👉 call transfer API / logic here

  //   setIsTransferProductOpen(false);
  // };

  const handleTransfer = async () => {
    if (!selectedTransferProduct || isTransferring) return;

    const product = products.find(
      (p) => p.serverId === selectedTransferProduct
    );

    if (!product) return;

    const outletId = useAuthStore.getState().user?.outlet_id;
    if (product.bottleVolumeML == null || product.pricePerML == null) {
      notifyError("Product was not added to Shots");
      return;
    }
    const payload = {
      insert_into_shot_products_table: {
        parent_product_id: product.serverId,
        "product-image": product.img,
        product_name: `${product.name}`,
        barcode: product.barcode,
        image_url: product.img,
        category_id: product.categoryId,
      },
      insert_into_purchase_table: {
        is_shots_product: true,
        outlet_id: outletId,
        //purchase_date: new Date().toISOString().replace("T", " ").substring(0, 19),
        purchase_date_to_display: new Date().toISOString().substring(0, 10),
        invoice_number: product.barcode,
        lot_no: `A-${product.lot_no}`,
        quantity: String(product.bottleVolumeML || 750),
        purchase_quantity: String(product.bottleVolumeML),
        unit: "ml",
        totalPaidPrice: String(product.bottleVolumeML * product.pricePerML),
        unit_purchase_price: String(product.pricePerML),
        purchasePriceTaxType: product.purchasePriceTaxType,
        purchasePriceTaxPercentage: String(product.purchasePriceTaxPercentage || "0.00"),
        unitPurchaseValueTax: String((product.sellingPrice * (product.tax || 0)) / 100),
        unitPurchaseValue: String(product.sellingPrice),
        selling_price_markup: String(product.sellingPricePerShotMarkupPercentage || "100.0000000000"),
        price: String((product.sellingPricePerShot / product.shotsvolumeml)),
        selling_price: String((product.sellingPricePerShot / product.shotsvolumeml)),
        is_tax_inclusive_for_unit_sales_price: product.is_tax_inclusive_for_unit_sales_price || false,
        inclusive_tax_percentage_per_unit: String(product.tax || "0.00"),
        sales_price_tax_value_per_unit: String(((product.sellingPricePerShot / product.shotsvolumeml) * (product.tax || 0)) / 100),
        addTaxToSalesPrice: false,
        addedTaxPercentageToSalesPrice: null,
        mfgDate: new Date().toISOString().substring(0, 10),
        expDate: null,
        is_auto_fill_volume_details: product.isautoFillVolumeDetails || false,
        bottle_volume_ml: String(product.bottleVolumeML || "750.0000000000"),
        price_per_ml: String(product.pricePerML || "0.0000000000"),
        shot_volume_ml: String(product.shotsvolumeml || "30.0000000000"),
        shots_per_bottle: String(product.shotsperbottel || "25.0000000000"),
        purchase_price_per_shot: String(product.purchasePricePerShot || "0.0000000000"),
        selling_price_per_shot_markup_percentage: String(product.sellingPricePerShotMarkupPercentage || "100.0000000000"),
        selling_price_per_shot: String(product.sellingPricePerShot || "0.0000000000"),
      },
    };

    setIsTransferring(true);
    try {
      await transferProductAPI(payload);
      notifySuccess("Product transferred successfully!");
      setSelectedTransferProduct("");
      await fetchProductsFromAPI();
      setIsTransferProductOpen(false);

    } catch (error) {
      notifyError(error.message || "Transfer failed. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  const preferredOrder = ["All", "Shots", "Butchery"];

  const sortedCategories = [...categories].sort((a, b) => {
    let indexA = preferredOrder.indexOf(a.category_name);
    let indexB = preferredOrder.indexOf(b.category_name);

    // If a category isn't in our list, move it to the end
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;

    return indexA - indexB;
  });

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ignore if user is typing in an input, textarea, or a select dropdown
      if (
        e.target.tagName === "INPUT" || 
        e.target.tagName === "TEXTAREA" || 
        e.target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // P for Petty Cash
      if (key === "p") {
        e.preventDefault();
        setIsPettyClicked(true);
      }

      // T for Transfer (only if in Shots category)
      if (key === "t" && filters.category.toLowerCase() === "shots") {
        e.preventDefault();
        setIsTransferProductOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filters.category, setIsPettyClicked]);

  return (
    <div className="header">
      <div className="pb-4 pt-2 px-2 flex gap-10 items-center">
        <div className="logo bg-white p-2 text-2xl rounded-md h-10 flex items-center font-bold">
          <img src={qkartsLogo} className="w-36 object-cover" />
        </div>
        <div className="product-categories flex gap-4">
          {sortedCategories.map((cat) => (
            <ProductCategoryComp
              key={cat.id}
              category={cat}
              filters={filters}
              setFilters={setFilters}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between pl-2 items-center search-button-group gap-4 w-full">
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
              <p className="text-xl py-1.5 px-3.5"><ShortcutLabel text="P" char="p" /></p>
            </div>
            {filters.category.toLowerCase() === "shots" &&
              <div onClick={() => setIsTransferProductOpen(true)} className="text-2xl p-1 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"><p className="px-2"><ShortcutLabel text="T" char="t" /></p></div>
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
            <div className="cart-icons text-[#555555] px-1.75 flex items-center border border-gray-300 rounded-md bg-white cursor-pointer" onClick={() => { setIsRetail(true); setIsRetailOpen(true) }}>
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
                <label className="font-medium text-[#555555]">Product Name</label>
                <Select
                  className="mt-1"
                  options={productOptions}
                  value={productOptions.find(opt => opt.value === selectedTransferProduct) || null}
                  onChange={(option) => setSelectedTransferProduct(option?.value || "")}
                  placeholder="Search or Select Product..."
                  isClearable
                  isSearchable
                  autoFocus
                  blurInputOnSelect={false}
                  closeMenuOnSelect={true}
                  tabSelectsValue={true}
                  menuPortalTarget={document.body}
                  styles={{
                    ...commonSelectStyles,
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6 text-sm">
              {/* <button
                disabled={!selectedTransferProduct}
                onClick={handleTransfer}
                className={`flex-1 py-2 font-bold text-white rounded-md bg-gradient-to-b from-secondary to-primary 
                ${!selectedTransferProduct
                    ? "opacity-70"
                    : "cursor-pointer"
                  }`}
              >
                Transfer
              </button> */}
              <button
                disabled={!selectedTransferProduct || isTransferring}
                onClick={handleTransfer}
                className={`flex-1 py-2 font-bold text-white rounded-md bg-gradient-to-b from-secondary to-primary 
  ${!selectedTransferProduct || isTransferring
                    ? "opacity-70"
                    : "cursor-pointer"
                  }`}
              >
                {isTransferring ? "Transferring..." : "Transfer"}
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
