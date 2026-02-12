import React, { useEffect, useState } from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
import { usePromotionStore } from "../../store/usePromotionStore";
import OfflineLoader from "../../components/OfflineLoader";
import { useProductStore } from "../../store/useProductStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import api from "../../utils/api";
import { useOutletStore } from "../../store/useOutletStore";
import { useAuthStore } from "../../store/useAuthStore";
import { FaEye } from "react-icons/fa";
import upDownIcon from '../../assets/icons/swap.svg'
// const categories = [
//   { label: "Category 1", value: "Category 1" },
//   { label: "Category 2", value: "Category 2" },
//   { label: "Category 3", value: "Category 3" },
// ];
const outlets = [
  { label: "Outlet 1", value: "Outlet 1" },
  { label: "Outlet 2", value: "Outlet 2" },
  { label: "Outlet 3", value: "Outlet 3" },
];

const Promotions = () => {
  //using stores
  const { promotions, hydrated: promoHydrated, hydrate: promoHydrate, addPromotion, editPromotion, deletePromotion, fetchPromotionFromAPI, SyncPromotions } = usePromotionStore();
  const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
  const { categories, hydrate: categoriesHydrate, hydrated: categoriesHydrated } = useCategoryStore();
  const { outlets, hydrate: outletHydrate, hydrated: outletHydrated } = useOutletStore();
  const user = useAuthStore((u) => u.user);

  //Variables
  const [filters, setFilters] = useState({
    id: "",
    promotion: "",
    product: "",
    category: "",
    outlet: user?.outlet_id || "",
    type: "",
  });
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [viewScope, setViewScope] = useState(false);
  const [viewScopeData, setViewScopeData] = useState(null);


  //Options
  const productOptions = products.map((p) => (
    {
      label: p.name,
      value: p.serverId,
    }
  ))

  const categoryOptions = categories.map((c) => (
    {
      label: c.category_name,
      value: c.id,
    }
  ))

  // const fetchOutlet = async () => {
  //   try {
  //     const res = await api.get('/tenant/outlet');
  //     console.log(res, "Outlet Response")
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  // useEffect(() => {
  //   fetchOutlet();
  // }, [])

  useEffect(() => {
    // Guard against repeated hydration (React StrictMode, re-renders, etc.)
    if (!promoHydrated) {
      promoHydrate();
    }
    if (!productsHydrated) {
      productsHydrate();
    }
    if (!categoriesHydrated) {
      categoriesHydrate();
    }
    if (!outletHydrated) {
      outletHydrate();
    }
  }, [promoHydrated, productsHydrated, categoriesHydrated, outletHydrated, promoHydrate, productsHydrate, categoriesHydrate, outletHydrate]);

  useEffect(() => {
    // Base filter: remove deleted
    let filtered = promotions.filter(p => !p.isDeleted);

    if (filters.id) {
      filtered = filtered.filter((p) => p.promotion_id === filters.id);
    }

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.outlet) {
      filtered = filtered.filter((p) => p.outlet?.includes(filters.outlet));
    }

    if (filters.product) {
      filtered = filtered.filter((p) => p.serverId === filters.product);
    }

    // De-duplicate by stable key to avoid double rows
    const seen = new Set();
    const unique = [];
    for (const p of filtered) {
      const key = String(
        p.serverId ??
        p.promotion_id ??
        p.localId ??
        p.id ??
        Math.random()
      );
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(p);
    }

    setFilteredPromotions(unique);
  }, [filters, promotions]);

  const handleViewScope = (promo) => {
    setViewScopeData(promo);
    setViewScope(true);
  };

  if (!productsHydrated || !promoHydrated || !categoriesHydrated || !outletHydrated) return <OfflineLoader />;
  // console.log(promotions, "Promotions")
  // console.log(products, "Products")
  // console.log(categories, "Categories")
  // console.log(outlets, "Outlets")

  const DAY_MAP = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",];

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatPromotionSchedule = (promo) => {
    const parts = [];

    /* ---------- DATE RANGE ---------- */
    if (promo.schedule_type === "DATE_RANGE") {
      if (promo.schedule_start_date && promo.schedule_end_date) {
        parts.push(
          `📅 ${formatDate(promo.schedule_start_date)} – ${formatDate(
            promo.schedule_end_date
          )}`
        );
      }
    }

    /* ---------- WEEKLY ---------- */
    if (promo.schedule_type === "WEEKLY") {
      if (
        promo.schedule_start_day !== null &&
        promo.schedule_end_day !== null
      ) {
        parts.push(
          `📆 ${DAY_MAP[promo.schedule_start_day - 1]} – ${DAY_MAP[promo.schedule_end_day - 1]
          }`
        );
      }
    }

    /* ---------- DAILY ---------- */
    if (promo.schedule_type === "DAILY") {
      parts.push("🔁 Daily");
    }

    /* ---------- TIME ---------- */
    if (promo.schedule_mode === "FULL_DAY") {
      parts.push("🕒 Full Day");
    }

    if (promo.schedule_mode === "TIME_RANGE") {
      if (promo.schedule_start_time && promo.schedule_end_time) {
        parts.push(
          `🕒 ${promo.schedule_start_time} – ${promo.schedule_end_time}`
        );
      }
    }

    return parts.length ? parts.join(" • ") : "-";
  };


  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Promotions</h1>
      <div className="filters grid grid-cols-4 gap-2 mt-4">
        <Select
          options={[
            ...(promotions ?? [])
              .slice()
              .sort((a, b) =>
                String(a?.promotion_name ?? "").localeCompare(
                  String(b?.promotion_name ?? ""),
                  undefined,
                  { sensitivity: "base" }
                )
              )
              .map((p) => ({
                label: p.promotion_name,
                value: p.promotion_id,
              })),
          ]}
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              id: option ? option.value : "",
            }));
          }}
          isClearable={true}
          placeholder="Select Promotion"
          components={{
            IndicatorSeparator: () => null,
          }}
          styles={commonSelectStyles}
        />
        <Select
          options={productOptions}
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              product: option ? option.value : "",
            }));
          }}
          isClearable={true}
          placeholder="Select Product"
          components={{
            IndicatorSeparator: () => null,
          }}
          styles={commonSelectStyles}
        />
        <Select
          options={categoryOptions}
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              category: option ? option.value : "",
            }));
          }}
          isClearable={true}
          placeholder="Select Category"
          components={{
            IndicatorSeparator: () => null,
          }}
          styles={commonSelectStyles}
        />
        <Select
          isDisabled={true} // Prevents user interaction
          value={{ label: user?.outlet_name, value: user?.outlet_id }}
          styles={commonSelectStyles}
          placeholder="Select Outlet"
          components={{ IndicatorSeparator: () => null }}
        />
      </div>
      <div className="table-container">
        <table className="w-full mt-4">
          <thead className="bg-linear-to-r from-primary to-secondary text-center">
            <tr>
              <th className="text-center p-2 text-white">Promotion</th>
              <th className="text-center p-2 text-white">Type</th>
              <th className="text-center p-2 text-white"><div className="flex items-center justify-center gap-1">
                <span>%</span>
                <img src={upDownIcon} alt="up/down" className="w-6 h-6" />
              </div></th>
              <th className="text-center p-2 text-white">Scope</th>
              <th className="text-center p-2 text-white">Schedule</th>
              <th className="text-center p-2 text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-center text-sm text-gray-600 p-2">
            {filteredPromotions.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center p-2">
                  No Promotion Found
                </td>
              </tr>
            )}
            {filteredPromotions.map((p) => (
              <tr key={p.promotion_id} className="even:bg-button-background">
                <td className="p-2">{p.promotion_name}</td>
                <td className="p-2">{p.type}</td>
                <td className="p-2">{p.type === "FREE" ? (
                  `${Array.isArray(p.free_item_id) ? p.free_item_id.length : 0} ITEM (s)`
                ) : (
                  <span className={p.type === "DISCOUNT" ? "text-red-500" : p.type === "HIKE" ? "text-green-600" : ""}>
                    {p.value} %
                  </span>
                )}</td>
                <td className="p-2">{p.promo_on}</td>
                <td className="p-2 whitespace-nowrap">
                  {formatPromotionSchedule(p)}
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => handleViewScope(p)}
                    className="inline-flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors w-8 h-8"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scope / Details Popup */}
      {viewScope && viewScopeData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">
                {viewScopeData.promotion_name}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setViewScope(false);
                  setViewScopeData(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Helper to map IDs to Names */}
            {(() => {
              const mapOptions = (items, labelKey, valueKey) =>
                (items || []).map((item) => ({
                  label: item[labelKey] ?? item.name ?? item.label,
                  value: item[valueKey] ?? item.id ?? item.value,
                }));

              const outletOptionsLocal = mapOptions(outlets, "outlet_name", "id");

              const getNames = (ids, options) => {
                if (!ids || (Array.isArray(ids) && ids.length === 0)) {
                  return ["All Selected"];
                }
                const arr = Array.isArray(ids) ? ids : [ids];
                return arr.map(
                  (id) =>
                    options.find((opt) => opt.value === id)?.label || id
                );
              };

              const outletNames = getNames(viewScopeData.outlet, outletOptionsLocal);
              const categoryNames = getNames(viewScopeData.category, categoryOptions);
              const productNames = getNames(viewScopeData.product, productOptions);
              const freeItems = getNames(
                viewScopeData.free_item_id,
                productOptions
              );

              return (
                <div className="space-y-6 text-sm text-gray-700">
                  {/* Outlets */}
                  <section>
                    <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
                      Applied Outlets
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {outletNames.map((name, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Target Categories or Products */}
                  <section>
                    <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
                      {viewScopeData.promo_on === "CATEGORY"
                        ? "Target Categories"
                        : "Target Products"}
                    </div>
                    {viewScopeData.promo_on === "CATEGORY" ? (
                      <div className="flex flex-wrap gap-2">
                        {categoryNames.map((name, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded bg-blue-50 text-slate-700 text-xs font-medium border border-blue-100"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          // Filter products that match the current outlet
                          const currentOutletId = user?.outlet_id;
                          const productIds = Array.isArray(viewScopeData.product)
                            ? viewScopeData.product
                            : viewScopeData.product
                              ? [viewScopeData.product]
                              : [];

                          // Get products that match outlet and are in the promotion
                          const matchedProducts = products.filter((p) => {
                            const matchesOutlet = p.outletId === currentOutletId;
                            const matchesPromotion = productIds.some(
                              (id) => String(p.serverId) === String(id) || String(p.id) === String(id)
                            );
                            return matchesOutlet && matchesPromotion;
                          });

                          if (matchedProducts.length === 0) {
                            return (
                              <p className="text-xs text-gray-500">
                                No products found for this outlet
                              </p>
                            );
                          }

                          // Calculate discounted/hiked price
                          const calculateFinalPrice = (basePrice) => {
                            if (!basePrice || !viewScopeData.value) return basePrice;
                            const percent = parseFloat(viewScopeData.value) || 0;

                            if (viewScopeData.type === "HIKE") {
                              return basePrice + (basePrice * (percent / 100));
                            } else {
                              // DISCOUNT
                              return basePrice - (basePrice * (percent / 100));
                            }
                          };

                          return matchedProducts.map((product) => {
                            const sellingPrice = product.sellingPrice || product.selling_price || product.price || 0;
                            const finalPrice = calculateFinalPrice(sellingPrice);

                            return (
                              <div
                                key={product.serverId || product.id}
                                className="flex items-center justify-between px-3 py-2 rounded bg-blue-50 border border-blue-100"
                              >
                                <span className="text-xs font-medium text-slate-700">
                                  {product.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  {sellingPrice > 0 ? (
                                    <>
                                      <span className="text-xs text-gray-400 line-through">
                                        ₹{sellingPrice.toFixed(2)}
                                      </span>
                                      <span className={`text-xs font-bold ${viewScopeData.type === "HIKE"
                                        ? "text-green-600"
                                        : "text-red-500"
                                        }`}>
                                        ₹{finalPrice.toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      Price not available
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </section>

                  {/* Free Items */}
                  {viewScopeData.type === "FREE" && (
                    <section>
                      <div className="mb-2 font-semibold text-xs uppercase text-gray-500">
                        Free Items
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {freeItems.map((name, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded bg-blue-50 text-slate-700 text-xs font-bold border border-blue-100"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
