import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useLowStockStore } from "../../store/useLowStockStore";
import OfflineLoader from "../../components/OfflineLoader";
import { commonSelectStyles } from "../../components/common/select/selectStyle";

const LowStock = () => {
  const { lowStock, hydrate, hydrated } = useLowStockStore();

  const [filters, setFilters] = useState({
    product: "",
    category: "",
    outlet: "",
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <OfflineLoader />;

  // 🔹 Build filter dropdown options from data
  const products = [
    ...new Set(lowStock.map((i) => i.productName).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  const categories = [
    ...new Set(lowStock.map((i) => i.categoryName).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  const outlets = [
    ...new Set(lowStock.map((i) => i.outletName).filter(Boolean)),
  ].map((v) => ({ label: v, value: v }));

  // 🔹 Filter logic
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
      <div className="filters grid grid-cols-3 gap-2 mt-4">
        <Select
          options={outlets}
          isClearable
          placeholder="Select Outlet"
          styles={commonSelectStyles}
          onChange={(o) =>
            setFilters((p) => ({ ...p, outlet: o?.value || "" }))
          }
        />

        <Select
          options={categories}
          isClearable
          placeholder="Select Category"
          styles={commonSelectStyles}
          onChange={(o) =>
            setFilters((p) => ({ ...p, category: o?.value || "" }))
          }
        />

        <Select
          options={products}
          isClearable
          placeholder="Select Product"
          styles={commonSelectStyles}
          onChange={(o) =>
            setFilters((p) => ({ ...p, product: o?.value || "" }))
          }
        />
      </div>

      {/* Table */}
      <table className="w-full mt-4">
        <thead className="bg-linear-to-r from-primary to-secondary text-white">
          <tr>
            <th className="p-2">Product</th>
            
            <th className="p-2">Category</th>
            <th className="p-2">Outlet</th>
            <th className="p-2">Stock</th>
          </tr>
        </thead>

        <tbody className="text-center text-sm text-gray-600">
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="p-3">
                No Low Stock Found
              </td>
            </tr>
          )}

          {filtered.map((ls) => (
            <tr key={ls.localId} className="even:bg-gray-100">
              <td className="p-2">{ls.productName}</td>
              <td className="p-2">{ls.categoryName}</td>
              <td className="p-2">{ls.outletName}</td>
              <td className="p-2 text-red-600 font-semibold">{ls.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LowStock;
