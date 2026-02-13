// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { commonSelectStyles } from "../../components/common/select/selectStyle";
// import { usePromotionStore } from "../../store/usePromotionStore";
// import OfflineLoader from "../../components/OfflineLoader";
// import { useProductStore } from "../../store/useProductStore";
// import { useCategoryStore } from "../../store/useCategoryStore";
// import api from "../../utils/api";
// import { useOutletStore } from "../../store/useOutletStore";
// import { useAuthStore } from "../../store/useAuthStore";
// import { FaEye } from "react-icons/fa";
// import upDownIcon from '../../assets/icons/swap.svg'
// // const categories = [
// //   { label: "Category 1", value: "Category 1" },
// //   { label: "Category 2", value: "Category 2" },
// //   { label: "Category 3", value: "Category 3" },
// // ];
// const outlets = [
//   { label: "Outlet 1", value: "Outlet 1" },
//   { label: "Outlet 2", value: "Outlet 2" },
//   { label: "Outlet 3", value: "Outlet 3" },
// ];

// const Promotions = () => {
//   //using stores
//   const { promotions, hydrated: promoHydrated, hydrate: promoHydrate, addPromotion, editPromotion, deletePromotion, fetchPromotionFromAPI, SyncPromotions } = usePromotionStore();
//   const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
//   const { categories, hydrate: categoriesHydrate, hydrated: categoriesHydrated } = useCategoryStore();
//   const { outlets, hydrate: outletHydrate, hydrated: outletHydrated } = useOutletStore();
//   const user = useAuthStore((u) => u.user);

//   //Variables
//   const [filters, setFilters] = useState({
//     id: "",
//     promotion: "",
//     product: "",
//     category: "",
//     outlet: user?.outlet_id || "",
//     type: "",
//   });
//   const [filteredPromotions, setFilteredPromotions] = useState([]);
//   const [viewScope, setViewScope] = useState(false);
//   const [viewScopeData, setViewScopeData] = useState(null);


//   //Options
//   const productOptions = products.map((p) => (
//     {
//       label: p.name,
//       value: p.serverId,
//     }
//   ))

//   const categoryOptions = categories.map((c) => (
//     {
//       label: c.category_name,
//       value: c.id,
//     }
//   ))

//   // const fetchOutlet = async () => {
//   //   try {
//   //     const res = await api.get('/tenant/outlet');
//   //     console.log(res, "Outlet Response")
//   //   } catch (err) {
//   //     console.log(err)
//   //   }
//   // }

//   // useEffect(() => {
//   //   fetchOutlet();
//   // }, [])

//   useEffect(() => {
//     // Guard against repeated hydration (React StrictMode, re-renders, etc.)
//     if (!promoHydrated) {
//       promoHydrate();
//     }
//     if (!productsHydrated) {
//       productsHydrate();
//     }
//     if (!categoriesHydrated) {
//       categoriesHydrate();
//     }
//     if (!outletHydrated) {
//       outletHydrate();
//     }
//   }, [promoHydrated, productsHydrated, categoriesHydrated, outletHydrated, promoHydrate, productsHydrate, categoriesHydrate, outletHydrate]);

//   useEffect(() => {
//     // Base filter: remove deleted
//     let filtered = promotions.filter(p => !p.isDeleted);

//     if (filters.id) {
//       filtered = filtered.filter((p) => p.promotion_id === filters.id);
//     }

//     if (filters.category) {
//       filtered = filtered.filter((p) => p.category === filters.category);
//     }

//     if (filters.outlet) {
//       filtered = filtered.filter((p) => p.outlet?.includes(filters.outlet));
//     }

//     if (filters.product) {
//       filtered = filtered.filter((p) => p.serverId === filters.product);
//     }

//     // De-duplicate by stable key to avoid double rows
//     const seen = new Set();
//     const unique = [];
//     for (const p of filtered) {
//       const key = String(
//         p.serverId ??
//         p.promotion_id ??
//         p.localId ??
//         p.id ??
//         Math.random()
//       );
//       if (seen.has(key)) continue;
//       seen.add(key);
//       unique.push(p);
//     }

//     setFilteredPromotions(unique);
//   }, [filters, promotions]);

//   const handleViewScope = (promo) => {
//     setViewScopeData(promo);
//     setViewScope(true);
//   };

//   if (!productsHydrated || !promoHydrated || !categoriesHydrated || !outletHydrated) return <OfflineLoader />;
//   // console.log(promotions, "Promotions")
//   // console.log(products, "Products")
//   // console.log(categories, "Categories")
//   // console.log(outlets, "Outlets")

//   const DAY_MAP = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",];

//   const formatDate = (date) => {
//     if (!date) return "";
//     return new Date(date).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//     });
//   };

//   const formatPromotionSchedule = (promo) => {
//     const parts = [];

//     /* ---------- DATE RANGE ---------- */
//     if (promo.schedule_type === "DATE_RANGE") {
//       if (promo.schedule_start_date && promo.schedule_end_date) {
//         parts.push(
//           `📅 ${formatDate(promo.schedule_start_date)} – ${formatDate(
//             promo.schedule_end_date
//           )}`
//         );
//       }
//     }

//     /* ---------- WEEKLY ---------- */
//     if (promo.schedule_type === "WEEKLY") {
//       if (
//         promo.schedule_start_day !== null &&
//         promo.schedule_end_day !== null
//       ) {
//         parts.push(
//           `📆 ${DAY_MAP[promo.schedule_start_day - 1]} – ${DAY_MAP[promo.schedule_end_day - 1]
//           }`
//         );
//       }
//     }

//     /* ---------- DAILY ---------- */
//     if (promo.schedule_type === "DAILY") {
//       parts.push("🔁 Daily");
//     }

//     /* ---------- TIME ---------- */
//     if (promo.schedule_mode === "FULL_DAY") {
//       parts.push("🕒 Full Day");
//     }

//     if (promo.schedule_mode === "TIME_RANGE") {
//       if (promo.schedule_start_time && promo.schedule_end_time) {
//         parts.push(
//           `🕒 ${promo.schedule_start_time} – ${promo.schedule_end_time}`
//         );
//       }
//     }

//     return parts.length ? parts.join(" • ") : "-";
//   };


//   return (
//     <div className="bg-background w-full h-full p-4">
//       <h1 className="text-2xl font-bold text-gray-700">Promotions</h1>
//       <div className="filters grid grid-cols-4 gap-2 mt-4">
//         <Select
//           options={[
//             ...(promotions ?? [])
//               .slice()
//               .sort((a, b) =>
//                 String(a?.promotion_name ?? "").localeCompare(
//                   String(b?.promotion_name ?? ""),
//                   undefined,
//                   { sensitivity: "base" }
//                 )
//               )
//               .map((p) => ({
//                 label: p.promotion_name,
//                 value: p.promotion_id,
//               })),
//           ]}
//           onChange={(option) => {
//             setFilters((prev) => ({
//               ...prev,
//               id: option ? option.value : "",
//             }));
//           }}
//           isClearable={true}
//           placeholder="Select Promotion"
//           components={{
//             IndicatorSeparator: () => null,
//           }}
//           styles={commonSelectStyles}
//         />
//         <Select
//           options={productOptions}
//           onChange={(option) => {
//             setFilters((prev) => ({
//               ...prev,
//               product: option ? option.value : "",
//             }));
//           }}
//           isClearable={true}
//           placeholder="Select Product"
//           components={{
//             IndicatorSeparator: () => null,
//           }}
//           styles={commonSelectStyles}
//         />
//         <Select
//           options={categoryOptions}
//           onChange={(option) => {
//             setFilters((prev) => ({
//               ...prev,
//               category: option ? option.value : "",
//             }));
//           }}
//           isClearable={true}
//           placeholder="Select Category"
//           components={{
//             IndicatorSeparator: () => null,
//           }}
//           styles={commonSelectStyles}
//         />
//         <Select
//           // isDisabled={true} // Prevents user interaction
//           // options={outletOptionsLocal}
//           value={{ label: user?.outlet_name, value: user?.outlet_id }}
//           styles={commonSelectStyles}
//           placeholder="Select Outlet"
//           components={{ IndicatorSeparator: () => null }}
//         />
//         <Select
//           isDisabled={true} // Prevents user interaction
//           value={{ label: user?.outlet_name, value: user?.outlet_id }}
//           styles={commonSelectStyles}
//           placeholder="Select Type"
//           components={{ IndicatorSeparator: () => null }}
//         />
//         <Select
//           isDisabled={true} // Prevents user interaction
//           value={{ label: user?.outlet_name, value: user?.outlet_id }}
//           styles={commonSelectStyles}
//           placeholder="Select Schedule"
//           components={{ IndicatorSeparator: () => null }}
//         />
//       </div>
//       <div className="table-container">
//         <table className="w-full mt-4">
//           <thead className="bg-linear-to-r from-primary to-secondary text-center">
//             <tr>
//               <th className="text-center p-2 text-white">Promotion</th>
//               <th className="text-center p-2 text-white">Type</th>
//               <th className="text-center p-2 text-white">Start Date</th>
//               <th className="text-center p-2 text-white">End Date</th>
//               <th className="text-center p-2 text-white">Category</th>
//               <th className="text-center p-2 text-white">Product</th>
//               <th className="text-center p-2 text-white"><div className="flex items-center justify-center gap-1">
//                 <span>%</span>
//                 <img src={upDownIcon} alt="up/down" className="w-6 h-6" />
//               </div></th>
//               <th className="text-center p-2 text-white">Price</th>
//               <th className="text-center p-2 text-white">Outlet</th>
//             </tr>
//           </thead>
//           <tbody className="text-center text-sm text-gray-600 p-2">
//             {filteredPromotions.length === 0 && (
//               <tr>
//                 <td colSpan={11} className="text-center p-2">
//                   No Promotion Found
//                 </td>
//               </tr>
//             )}
//             {filteredPromotions.map((p) => (
//               <tr key={p.promotion_id} className="even:bg-button-background">
//                 <td className="p-2">{p.promotion_name}</td>
//                 <td className="p-2">{p.type}</td>
//                 <td className="p-2 whitespace-nowrap">
//                   {formatPromotionSchedule(p)}
//                 </td>
//                 <td className="p-2 whitespace-nowrap">
//                   {formatPromotionSchedule(p)}
//                 </td>
//                 <td className="p-2">{p.promo_on}</td>
//                 <td className="p-2">{p.promo_on}</td>
//                 <td className="p-2">{p.type === "FREE" ? (
//                   `${Array.isArray(p.free_item_id) ? p.free_item_id.length : 0} ITEM (s)`
//                 ) : (
//                   <span className={p.type === "DISCOUNT" ? "text-red-500" : p.type === "HIKE" ? "text-green-600" : ""}>
//                     {p.value} %
//                   </span>
//                 )}</td>
//                 <td>
//                   {p.value}
//                 </td>
//                 <td>
//                   {p.outlet[0]}
//                 </td>

//                 {/* <td className="p-2">
//                   <button
//                     type="button"
//                     onClick={() => handleViewScope(p)}
//                     className="inline-flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors w-8 h-8"
//                   >
//                     <FaEye />
//                   </button>
//                 </td> */}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Scope / Details Popup */}
//       {viewScope && viewScopeData && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
//             <div className="flex items-start justify-between mb-4">
//               <h2 className="text-lg font-bold text-primary">
//                 {viewScopeData.promotion_name}
//               </h2>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setViewScope(false);
//                   setViewScopeData(null);
//                 }}
//                 className="text-sm text-gray-500 hover:text-gray-800"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Helper to map IDs to Names */}
//             {(() => {
//               const mapOptions = (items, labelKey, valueKey) =>
//                 (items || []).map((item) => ({
//                   label: item[labelKey] ?? item.name ?? item.label,
//                   value: item[valueKey] ?? item.id ?? item.value,
//                 }));

//               const outletOptionsLocal = mapOptions(outlets, "outlet_name", "id");

//               const getNames = (ids, options) => {
//                 if (!ids || (Array.isArray(ids) && ids.length === 0)) {
//                   return ["All Selected"];
//                 }
//                 const arr = Array.isArray(ids) ? ids : [ids];
//                 return arr.map(
//                   (id) =>
//                     options.find((opt) => opt.value === id)?.label || id
//                 );
//               };

//               const outletNames = getNames(viewScopeData.outlet, outletOptionsLocal);
//               const categoryNames = getNames(viewScopeData.category, categoryOptions);
//               const productNames = getNames(viewScopeData.product, productOptions);
//               const freeItems = getNames(
//                 viewScopeData.free_item_id,
//                 productOptions
//               );

//               return (
//                 <div className="space-y-6 text-sm text-gray-700">
//                   {/* Outlets */}
//                   <section>
//                     <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
//                       Applied Outlets
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {outletNames.map((name, i) => (
//                         <span
//                           key={i}
//                           className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
//                         >
//                           {name}
//                         </span>
//                       ))}
//                     </div>
//                   </section>

//                   {/* Target Categories or Products */}
//                   <section>
//                     <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
//                       {viewScopeData.promo_on === "CATEGORY"
//                         ? "Target Categories"
//                         : "Target Products"}
//                     </div>
//                     {viewScopeData.promo_on === "CATEGORY" ? (
//                       <div className="flex flex-wrap gap-2">
//                         {categoryNames.map((name, i) => (
//                           <span
//                             key={i}
//                             className="px-2.5 py-1 rounded bg-blue-50 text-slate-700 text-xs font-medium border border-blue-100"
//                           >
//                             {name}
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         {(() => {
//                           // Filter products that match the current outlet
//                           const currentOutletId = user?.outlet_id;
//                           const productIds = Array.isArray(viewScopeData.product)
//                             ? viewScopeData.product
//                             : viewScopeData.product
//                               ? [viewScopeData.product]
//                               : [];

//                           // Get products that match outlet and are in the promotion
//                           const matchedProducts = products.filter((p) => {
//                             const matchesOutlet = p.outletId === currentOutletId;
//                             const matchesPromotion = productIds.some(
//                               (id) => String(p.serverId) === String(id) || String(p.id) === String(id)
//                             );
//                             return matchesOutlet && matchesPromotion;
//                           });

//                           if (matchedProducts.length === 0) {
//                             return (
//                               <p className="text-xs text-gray-500">
//                                 No products found for this outlet
//                               </p>
//                             );
//                           }

//                           // Calculate discounted/hiked price
//                           const calculateFinalPrice = (basePrice) => {
//                             if (!basePrice || !viewScopeData.value) return basePrice;
//                             const percent = parseFloat(viewScopeData.value) || 0;

//                             if (viewScopeData.type === "HIKE") {
//                               return basePrice + (basePrice * (percent / 100));
//                             } else {
//                               // DISCOUNT
//                               return basePrice - (basePrice * (percent / 100));
//                             }
//                           };

//                           return matchedProducts.map((product) => {
//                             const sellingPrice = product.sellingPrice || product.selling_price || product.price || 0;
//                             const finalPrice = calculateFinalPrice(sellingPrice);

//                             return (
//                               <div
//                                 key={product.serverId || product.id}
//                                 className="flex items-center justify-between px-3 py-2 rounded bg-blue-50 border border-blue-100"
//                               >
//                                 <span className="text-xs font-medium text-slate-700">
//                                   {product.name}
//                                 </span>
//                                 <div className="flex items-center gap-2">
//                                   {sellingPrice > 0 ? (
//                                     <>
//                                       <span className="text-xs text-gray-400 line-through">
//                                         ₹{sellingPrice.toFixed(2)}
//                                       </span>
//                                       <span className={`text-xs font-bold ${viewScopeData.type === "HIKE"
//                                         ? "text-green-600"
//                                         : "text-red-500"
//                                         }`}>
//                                         ₹{finalPrice.toFixed(2)}
//                                       </span>
//                                     </>
//                                   ) : (
//                                     <span className="text-xs text-gray-400">
//                                       Price not available
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             );
//                           });
//                         })()}
//                       </div>
//                     )}
//                   </section>

//                   {/* Free Items */}
//                   {viewScopeData.type === "FREE" && (
//                     <section>
//                       <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
//                         Free Items
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {freeItems.map((name, i) => (
//                           <span
//                             key={i}
//                             className="px-2.5 py-1 rounded bg-blue-50 text-slate-700 text-xs font-bold border border-blue-100"
//                           >
//                             {name}
//                           </span>
//                         ))}
//                       </div>
//                     </section>
//                   )}
//                 </div>
//               );
//             })()}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Promotions;




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