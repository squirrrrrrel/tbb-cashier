import React, { useEffect, useState } from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
import bottleImage from "../../assets/images/bottle.jpg";
const products = [
  { label: "Product 1", value: "Product 1" },
  { label: "Product 2", value: "Product 2" },
  { label: "Product 3", value: "Product 3" },
];
const categories = [
  { label: "Category 1", value: "Category 1" },
  { label: "Category 2", value: "Category 2" },
  { label: "Category 3", value: "Category 3" },
];
const outlets = [
  { label: "Outlet 1", value: "Outlet 1" },
  { label: "Outlet 2", value: "Outlet 2" },
  { label: "Outlet 3", value: "Outlet 3" },
];
const lowStockData = [
  {
    id: "1",
    img: bottleImage,
    category: "Category 1",
    product: "Product 1",
    outlet: "Outlet 1",
    stock: "10",
  },
  {
    id: "2",
    img: bottleImage,
    category: "Category 2",
    product: "Product 2",
    outlet: "Outlet 2",
    stock: "20",
  },
];

const LowStock = () => {
  const [filters, setFilters] = useState({
    product: "",
    category: "",
    outlet: "",
  });
  const [filteredLowStock, setFilteredLowStock] = useState([]);

  useEffect(() => {
    let filtered = [...lowStockData];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.outlet) {
      filtered = filtered.filter((p) => p.outlet === filters.outlet);
    }

    if (filters.product) {
      filtered = filtered.filter((p) => p.product === filters.product);
    }

    setFilteredLowStock(filtered);
  }, [filters]);

  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Low Stock List</h1>
      <div className="filters grid grid-cols-3 gap-2 mt-4">
        <Select
          options={outlets}
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              outlet: option ? option.value : "",
            }));
          }}
          isClearable={true}
          placeholder="Select Outlet"
          components={{
            IndicatorSeparator: () => null,
          }}
          styles={commonSelectStyles}
        />
        <Select
          options={categories}
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
          options={products}
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
      </div>
      <div className="table-container">
        <table className="w-full mt-4">
          <thead className="bg-linear-to-r from-primary to-secondary text-center">
            <tr>
              <th className="text-center p-2 text-white">Image</th>
              <th className="text-center p-2 text-white">Product</th>
              <th className="text-center p-2 text-white">Category</th>
              <th className="text-center p-2 text-white">Outlet</th>
              <th className="text-center p-2 text-white">Stock</th>
            </tr>
          </thead>
          <tbody className="text-center text-sm text-gray-600 p-2">
            {filteredLowStock.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center p-2">
                  No Low Stock Found
                </td>
              </tr>
            )}
            {filteredLowStock.map((ls) => (
              <tr key={ls.id} className="even:bg-button-background">
                <td className="p-2 flex justify-center">
                  <img src={ls.img} alt="image" className="w-10 h-10" />
                </td>
                <td className="p-2">{ls.product}</td>
                <td className="p-2">{ls.category}</td>
                <td className="p-2">{ls.outlet}</td>
                <td className="p-2 text-red-700 font-semibold">{ls.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStock;
