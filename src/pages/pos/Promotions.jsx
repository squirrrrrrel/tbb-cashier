import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
import { usePromotionStore } from "../../store/usePromotionStore";
import OfflineLoader from "../../components/OfflineLoader";
import { useProductStore } from "../../store/useProductStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import { useOutletStore } from "../../store/useOutletStore";
import { useAuthStore } from "../../store/useAuthStore";
import upDownIcon from '../../assets/icons/swap.svg';

const Promotions = () => {
  const { promotions, hydrated: promoHydrated, hydrate: promoHydrate } = usePromotionStore();
  const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
  const { categories, hydrate: categoriesHydrate, hydrated: categoriesHydrated } = useCategoryStore();
  const { outlets, hydrate: outletHydrate, hydrated: outletHydrated } = useOutletStore();
  const user = useAuthStore((u) => u.user);

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
    { label: "Free", value: "FREE" },
  ];

  const combinedScheduleOptions = [
    { label: "Fixed 24hours", value: "WEEKLY:FULL_DAY" },
    { label: "Fixed with Timer", value: "WEEKLY:TIME_RANGE" },
    { label: "Periodic 24hours", value: "DATE_RANGE:FULL_DAY" },
    { label: "Periodic with Timer", value: "DATE_RANGE:TIME_RANGE" },
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
    const formattedTime = p.schedule_mode === "FULL_DAY" ? "24 Hours" : formatTimeStr(time);

    return (
      <div className="flex flex-col text-xs">
        <span>{formattedDate || "-"}</span>
        <span>{formattedTime || "-"}</span>
        <span className="">{formattedDay || "-"}</span>
      </div>
    );
  };

  // Filter Logic
  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      if (p.isDeleted) return false;
      const matchName = !filters.promotionName || p.promotion_name === filters.promotionName;
      const matchType = !filters.type || p.type === filters.type;
      const matchOutlet = !filters.outlet || p.outlet?.includes(filters.outlet);

      const matchCategory = !filters.category || (Array.isArray(p.category) ? p.category.includes(filters.category) : p.category === filters.category);
      const matchProduct = !filters.product || (Array.isArray(p.product) ? p.product.includes(filters.product) : p.serverId === filters.product);

      const matchSchedule = !filters.schedule || (() => {
        const [sType, sMode] = filters.schedule.split(":");
        return p.schedule_type === sType && p.schedule_mode === sMode;
      })();

      return matchName && matchType && matchOutlet && matchCategory && matchProduct && matchSchedule;
    });
  }, [filters, promotions]);

  if (!productsHydrated || !promoHydrated || !categoriesHydrated || !outletHydrated) return <OfflineLoader />;

  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Promotions</h1>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
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

        <Select
          options={outletOptions}
          isClearable
          value={outletOptions.find(o => o.value === filters.outlet)}
          styles={commonSelectStyles}
          placeholder="Select Outlet"
          onChange={(opt) => setFilters(prev => ({ ...prev, outlet: opt?.value || "" }))}
        />

        <Select options={typeOptions} isClearable placeholder="Select Type" styles={commonSelectStyles}
          onChange={(opt) => setFilters(prev => ({ ...prev, type: opt?.value || "" }))} />

        <Select options={combinedScheduleOptions} isClearable placeholder="Select Schedule" styles={commonSelectStyles}
          onChange={(opt) => setFilters(prev => ({ ...prev, schedule: opt?.value || "" }))} />
      </div>

      {/* Table */}
      <div className="table-container overflow-x-auto mt-6">
        <table className="w-full">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="p-2">Type</th>
              <th className="p-2">Promotion</th>
              <th className="p-2">Start Details</th>
              <th className="p-2">End Details</th>
              <th className="p-2">Category</th>
              <th className="p-2">Product</th>
              <th className="p-2">
                <div className="flex items-center justify-center gap-1">
                  <span>%</span>
                  <img src={upDownIcon} alt="upDownIcon" className="w-6 h-6 invert" />
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
                    <td className="p-2"><span>{p.type}</span></td>
                    <td className="p-2">{formatSchedulePart(p, "START")}</td>
                    <td className="p-2">{formatSchedulePart(p, "END")}</td>
                    <td className="p-2 max-w-[150px] truncate">{getNameFromId(p.category, categories, "category_name")}</td>
                    <td className="p-2 max-w-[150px] truncate">{getNameFromId(p.product, products, "name")}</td>
                    <td className={`p-2 ${p.type === "HIKE" ? "text-green-600" : "text-red-500"}`}>{p.type === "FREE" ? "FREE" : `${p.value}%`}</td>
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