import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
import { usePromotionStore } from "../../store/usePromotionStore";
import OfflineLoader from "../../components/OfflineLoader";
import { useProductStore } from "../../store/useProductStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import { useOutletStore } from "../../store/useOutletStore";
import { useAuthStore } from "../../store/useAuthStore";
import upDownIcon from '../../assets/images/upDown.png';
import { useRetail } from "../../hooks/useRetail";
import { useNavigate } from "react-router-dom";

const Promotions = () => {
  const { promotions, hydrated: promoHydrated, hydrate: promoHydrate } = usePromotionStore();
  const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
  const { categories, hydrate: categoriesHydrate, hydrated: categoriesHydrated } = useCategoryStore();
  const { outlets, hydrate: outletHydrate, hydrated: outletHydrated } = useOutletStore();
  const user = useAuthStore((u) => u.user);
  const navigate = useNavigate();
  const { setIsRetail, setIsRetailOpen } = useRetail();

  const [filters, setFilters] = useState({
    promotionName: "",
    product: "",
    category: "",
    outlet: user?.outlet_id || "",
    type: "",
    schedule: ""
  });

  useEffect(() => {
    if (!promoHydrated) promoHydrate();
    if (!productsHydrated) productsHydrate();
    if (!categoriesHydrated) categoriesHydrate();
    if (!outletHydrated) outletHydrate();
  }, [promoHydrated, productsHydrated, categoriesHydrated, outletHydrated]);

  // Options
  const productOptions = useMemo(() => products.map(p => ({ label: p.name, value: p.serverId || p.id })), [products]);
  const categoryOptions = useMemo(() => categories.map(c => ({ label: c.category_name, value: c.id })), [categories]);
  const promoOptions = useMemo(() => {
    // Get raw names exactly as they appear in the data
    const allNames = promotions
      .filter(p => !p.isDeleted && p.promotion_name)
      .map(p => p.promotion_name);

    // Set will treat "50 Off" and "50 off" as different values
    const uniqueNames = [...new Set(allNames)].sort((a, b) => a.localeCompare(b));

    return uniqueNames.map(name => ({
      label: name,
      value: name
    }));
  }, [promotions]);

  const typeOptions = [
    { label: "Discount", value: "DISCOUNT" },
    { label: "Hike", value: "HIKE" },
    // { label: "Free", value: "FREE" },
  ];

  const combinedScheduleOptions = [
    { label: "Fixed 24hours", value: "WEEKLY:FULL_DAY" },
    { label: "Fixed with Timer", value: "WEEKLY:TIME_RANGE" },
    { label: "Fixed Between", value: "BETWEEN_DAYS:TIME_RANGE" },
    { label: "Periodic 24hours", value: "DATE_RANGE:FULL_DAY" },
    { label: "Periodic with Timer", value: "DATE_RANGE:TIME_RANGE" },
    { label: "Periodic Between", value: "BETWEEN_DATES:TIME_RANGE" },
  ];

  const outletOptions = useMemo(() =>
    outlets.map(o => ({
      label: o.outlet_name,
      value: o.id
    })),
    [outlets]);

  // Helper Functions for Table Display
  const DAY_MAP = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getNameFromId = (ids, store, labelKey) => {
    if (!ids) return "-";
    const idArray = Array.isArray(ids) ? ids : [ids];
    const names = idArray.map(id => {
      const item = store.find(s => String(s.serverId || s.id) === String(id));
      return item ? item[labelKey] : id;
    });
    return names.join(", ");
  };

  const getCategoryByProduct = (productIds) => {
    if (!productIds || (Array.isArray(productIds) && productIds.length === 0)) return "-";

    // Ensure we have an array of IDs
    const idArray = Array.isArray(productIds) ? productIds : [productIds];

    const catNames = idArray.map(pId => {
      // 1. Find the product in the store where serverId matches pId
      const product = products.find(prod => String(prod.serverId) === String(pId));

      if (!product) {
        return null;
      }

      // 2. Return the categoryName directly from the product object if it exists
      // Otherwise, find it in the categories store using product.categoryId
      if (product.categoryName) {
        return product.categoryName;
      }

      const category = categories.find(c => String(c.id) === String(product.categoryId));
      return category ? category.category_name : null;
    }).filter(Boolean); // Remove nulls

    // 3. Return unique category names
    const uniqueNames = [...new Set(catNames)];
    return uniqueNames.length > 0 ? uniqueNames.join(", ") : "Unknown Category";
  };

  const formatSchedulePart = (p, type = "START") => {
    const isStart = type === "START";
    const date = isStart ? p.schedule_start_date : p.schedule_end_date;
    const time = isStart ? p.schedule_start_time : p.schedule_end_time;
    const dayIdx = isStart ? p.schedule_start_day : p.schedule_end_day;

    const formattedDate = date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";
    const formattedDay = dayIdx ? DAY_MAP[dayIdx - 1] : "";
    const formatTimeStr = (timeStr) => {
      if (!timeStr) return "";
      // Splits 09:30:00 into [09, 30]
      const [hours, minutes] = timeStr.split(':');

      // For 24h format (HH:mm):
      // return `${hours}:${minutes}`;

      // OR for 12h format (9:30 AM), use this instead:
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${minutes} ${ampm}`;

    };
    const formattedTime = p.schedule_mode === "FULL_DAY" ? "FULL_DAY" : formatTimeStr(time);

    const dateOrDay = p.schedule_type === "WEEKLY" ? "week" : p.schedule_type === "BETWEEN_DAYS" ? "week" : p.schedule_type === "DATE_RANGE" ? "date" : p.schedule_type === "BETWEEN_DATES" ? "date" : "";

    return (
      <div className="flex flex-col text-xs">
        {dateOrDay === "week" && <span>{formattedDay ? `🗓️${formattedDay}` : ""}</span> }
        {dateOrDay === "date" && <span>{formattedDate ? `🗓️${formattedDate}` : ""}</span>}
        <span>{formattedTime ? `🕛${formattedTime}` : ""}</span>
      </div>
    );
  };

  // Filter Logic
  // Filter Logic
  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      if (p.isDeleted) return false;

      const promoProductIds = Array.isArray(p.product) ? p.product : [p.product];

      // Get actual product objects for these IDs
      const associatedProducts = products.filter(prod =>
        promoProductIds.map(String).includes(String(prod.serverId || prod.id))
      );

      // Filter: Only show promotion if at least one product exists in our list
      if (associatedProducts.length === 0) return false;

      // Filter: Category logic (checking product.category instead of p.category)
      const matchCategory = !filters.category || associatedProducts.some(prod =>
        String(prod.categoryId) === String(filters.category)
      );

      const matchName = !filters.promotionName || p.promotion_name === filters.promotionName;
      const matchType = !filters.type || p.type === filters.type;
      const matchOutlet = !filters.outlet || p.outlet?.includes(filters.outlet);
      const matchProduct = !filters.product || promoProductIds.map(String).includes(String(filters.product));

      const matchSchedule = !filters.schedule || (() => {
        const [sType, sMode] = filters.schedule.split(":");
        return p.schedule_type === sType && p.schedule_mode === sMode;
      })();

      return matchName && matchType && matchOutlet && matchCategory && matchProduct && matchSchedule;
    });
  }, [filters, promotions, products, categories]); // Added categories to deps

  if (!productsHydrated || !promoHydrated || !categoriesHydrated || !outletHydrated) return <OfflineLoader />;

  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Promotions</h1>

      {/* Filters Grid */}
      <div className="flex gap-2 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 flex-1">
          <Select
            options={promoOptions}
            isClearable
            placeholder="Select Promotion"
            styles={commonSelectStyles}
            // This matches "50 Off" state to "50 Off" option exactly
            value={promoOptions.find(opt => opt.value === filters.promotionName) || null}
            onChange={(opt) => setFilters(prev => ({ ...prev, promotionName: opt ? opt.value : "" }))}
          />

          <Select options={productOptions} isClearable placeholder="Select Product" styles={commonSelectStyles}
            onChange={(opt) => setFilters(prev => ({ ...prev, product: opt?.value || "" }))} />

          <Select options={categoryOptions} isClearable placeholder="Select Category" styles={commonSelectStyles}
            onChange={(opt) => setFilters(prev => ({ ...prev, category: opt?.value || "" }))} />

          <Select options={typeOptions} isClearable placeholder="Select Type" styles={commonSelectStyles}
            onChange={(opt) => setFilters(prev => ({ ...prev, type: opt?.value || "" }))} />

          <Select options={combinedScheduleOptions} isClearable placeholder="Select Schedule" styles={commonSelectStyles}
            onChange={(opt) => setFilters(prev => ({ ...prev, schedule: opt?.value || "" }))} />

          <Select
            isDisabled
            options={outletOptions}
            // isClearable
            value={outletOptions.find(o => o.value === filters.outlet)}
            styles={commonSelectStyles}
            placeholder="Select Outlet"
            onChange={(opt) => setFilters(prev => ({ ...prev, outlet: opt?.value || "" }))}
          />
        </div>
        <div className="cart-icons px-1.5 flex items-center text-[#555555] rounded-sm border border-2 border-gray-300 cursor-pointer bg-white" onClick={() => { setIsRetail(true); setIsRetailOpen(true); navigate("/pos/dashboard"); }}>
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

      {/* Table */}
      <div className="table-container overflow-x-auto mt-6">
        <table className="w-full">
          <thead className="bg-gradient-to-b from-secondary to-primary text-white text-center">
            <tr>
              <th className="p-2">Promotion</th>
              {/* <th className="p-2">Type</th> */}
              <th className="p-2">Start Details</th>
              <th className="p-2">End Details</th>
              <th className="p-2">Category</th>
              <th className="p-2">Product</th>
              <th className="p-2">
                <div className="flex items-center justify-center gap-1">
                  <span>%</span>
                  <img src={upDownIcon} alt="upDownIcon" className="w-6 h-6" />
                </div>
              </th>
              <th className="p-2">Price</th>
              <th className="p-2">Outlet</th>
            </tr>
          </thead>
          <tbody className="text-center text-sm text-gray-600">
            {filteredPromotions.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-gray-400">
                  No data matching filters
                </td>
              </tr>
            ) : (
              filteredPromotions.map((p) => {
                // Logic to find the price
                const getPriceDisplay = () => {
                  if (p.promo_on === "CATEGORY" || p.type === "FREE") return { old: null, current: "-" };

                  const targetProductId = Array.isArray(p.product) ? p.product[0] : p.product;
                  const productData = products.find(
                    (prod) => String(prod.serverId || prod.id) === String(targetProductId)
                  );

                  if (!productData) return { old: null, current: "-" };

                  const basePrice = parseFloat(productData.sellingPrice || productData.price || 0);
                  const promoValue = parseFloat(p.value || 0);

                  let finalPrice = basePrice;
                  if (p.type === "DISCOUNT") {
                    finalPrice = basePrice - basePrice * (promoValue / 100);
                  } else if (p.type === "HIKE") {
                    finalPrice = basePrice + basePrice * (promoValue / 100);
                  }

                  return {
                    old: `${basePrice.toFixed(2)}`,
                    current: `${finalPrice.toFixed(2)}`
                  };
                };
                const priceInfo = getPriceDisplay();
                return (
                  <tr key={p.promotion_id} className="even:bg-button-background">
                    <td className="p-2">{p.promotion_name}</td>
                    {/* <td className="p-2"><span>{p.type}</span></td> */}
                    <td className="p-2">{formatSchedulePart(p, "START")}</td>
                    <td className="p-2">{formatSchedulePart(p, "END")}</td>
                    <td className="p-2 max-w-[150px] truncate">{getCategoryByProduct(p.product)}</td>
                    <td className="p-2 max-w-[150px]">{getNameFromId(p.product, products, "name")}</td>
                    <td className={`p-2 ${p.type === "HIKE" ? "text-green-600" : "text-red-500"}`}>
                      {p.type === "HIKE" ? "+" : "-"}{p.type === "FREE" ? "FREE" : `${p.value}%`}</td>
                    <td className="p-2">
                      <div className="flex flex-col items-center justify-center">
                        {priceInfo.old && (<span className="line-through">{priceInfo.old}</span>)}
                        <span>{priceInfo.current}</span>
                      </div>
                    </td>
                    <td className="p-2">{getNameFromId(p.outlet?.[0], outlets, "outlet_name")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promotions;