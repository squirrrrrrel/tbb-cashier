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
    promoHydrate();
    productsHydrate();
    categoriesHydrate();
    outletHydrate();
    console.log(user);
  }, [promoHydrate, productsHydrate, categoriesHydrate, outletHydrate]);

  useEffect(() => {
    let filtered = promotions.filter(p => !p.isDeleted);
    if (filters.id) {
      filtered = filtered.filter((p) => p.promotion_id === filters.id);
    }

    // if (filters.type) {
    //   filtered = filtered.filter((p) => p.type === filters.type);
    // }

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.outlet) {
      filtered = filtered.filter((p) => p.outlet?.includes(filters.outlet));
    }

    if (filters.product) {
      filtered = filtered.filter((p) => p.serverId === filters.product);
    }

    setFilteredPromotions(filtered);
  }, [filters, promotions]);

  if (!productsHydrated || !promoHydrated || !categoriesHydrated || !outletHydrated) return <OfflineLoader />;
  // console.log(promotions, "Promotions")
  // console.log(products, "Products")
  // console.log(categories, "Categories")
  // console.log(outlets, "Outlets")

  const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          `📆 ${DAY_MAP[promo.schedule_start_day]} – ${DAY_MAP[promo.schedule_end_day]
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
              <th className="text-center p-2 text-white">Benefit</th>
              <th className="text-center p-2 text-white">Scope</th>
              <th className="text-center p-2 text-white">Condition</th>
              <th className="text-center p-2 text-white">Schedule</th>
              <th className="text-center p-2 text-white">Priority</th>
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
                <td className="p-2">{p.mode} {p.value}</td>
                <td className="p-2">{p.promo_on}</td>
                <td className="p-2">{p.condition_trigger ?? "-"}{p.condition_value}</td>
                <td className="p-2 whitespace-nowrap">
                  {formatPromotionSchedule(p)}
                </td>
                <td className="p-2">{p.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promotions;
