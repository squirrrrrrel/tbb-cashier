import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useLowStockStore } from "../../store/useLowStockStore";
import { useProductStore } from "../../store/useProductStore";
import OfflineLoader from "../../components/OfflineLoader";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
import defaultImg from "./../../assets/images/Default_Product_Img.png";
import { useCategoryStore } from "../../store/useCategoryStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useRetail } from "../../hooks/useRetail";
import { useNavigate } from "react-router-dom";

const LowStock = () => {
  const { lowStock, hydrate: lowStockHydrate, hydrated: lowStockHydrated } = useLowStockStore();
  const { products, hydrate: productHydrate, hydrated: productsHydrated } = useProductStore();
  const { categories, hydrate: categoriesHydrate, hydrated: categoriesHydrated } = useCategoryStore();
  const user = useAuthStore((u) => u.user);
  const navigate = useNavigate();
  const { setIsRetail, setIsRetailOpen } = useRetail();

  const [filters, setFilters] = useState({
    product: "",
    category: "",
    outlet: user?.outlet_name || "",
  });

  useEffect(() => {
    productHydrate();
    categoriesHydrate();
    lowStockHydrate();
  }, [productHydrate, categoriesHydrate, lowStockHydrate]);
  if (!productsHydrated && !categoriesHydrated && !lowStockHydrated) return <OfflineLoader />;


  const productOptions = [
    ...new Set(products.map((p) => p.name).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  const categoryOptions = [
    ...new Set(categories.map((i) => i.category_name).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  const outletOptions = [
    ...new Set(lowStock.map((i) => i.outletName).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  const filtered = lowStock.filter((p) => {
    if (filters.product && p.productName !== filters.product) return false;
    if (filters.category && p.categoryName !== filters.category) return false;
    if (filters.outlet && p.outletName !== filters.outlet) return false;
    return true;
  });

  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Low Stock List</h1>

      {/* Filters */}
      <div className="flex gap-2 mt-4">
        <div className="filters grid grid-cols-3 gap-2 flex-1 color-#117f9c">
          <Select
            options={outletOptions}
            isDisabled={true}
            value={outletOptions.find(o => o.value === (user?.outlet_name || filters.outlet))}
            placeholder="Select Outlet"
            styles={commonSelectStyles}
            onChange={(o) =>
              setFilters((p) => ({ ...p, outlet: o?.value || "" }))
            }
          />

          <Select
            options={categoryOptions}
            isClearable
            placeholder="Select Category"
            styles={commonSelectStyles}
            onChange={(o) =>
              setFilters((p) => ({ ...p, category: o?.value || "" }))
            }
          />

          <Select
            options={productOptions}
            isClearable
            placeholder="Select Product"
            styles={commonSelectStyles}
            onChange={(o) =>
              setFilters((p) => ({ ...p, product: o?.value || "" }))
            }
          />
        </div>
        {/* </div> */}
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
      <table className="w-full mt-4">
        <thead className="bg-linear-to-r from-primary to-secondary text-white">
          <tr>
            <th className="p-2">Image</th>
            <th className="p-2">Product</th>
            <th className="p-2">Category</th>
            <th className="p-2">Outlet</th>
            <th className="p-2">Stock</th>
          </tr>
        </thead>

        <tbody className="text-center text-sm text-gray-600">
          {filtered.map((ls) => (
            <tr key={ls.localId} className="even:bg-gray-100">
              <td className="p-2 flex items-center justify-center">
                {ls.img ? (
                  <img
                    src={ls.img}
                    alt={defaultImg}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <img
                    src={defaultImg}
                    alt={defaultImg}
                    className="w-10 h-10 object-cover"
                  />
                )}
              </td>
              <td className="p-2">{ls.productName}</td>
              <td className="p-2">{ls.categoryName}</td>
              <td className="p-2">{ls.outletName}</td>
              <td className="p-2 text-red-600 font-semibold">
                {ls.stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="text-center text-[#555555]">
          <p colSpan={4} className="p-3">
            No Low Stock Found
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStock;
