import React, { useEffect, useState } from "react";
import Select from "react-select";
import { commonSelectStyles } from "../../components/common/select/selectStyle";
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
const promotionsData = [
  {
    id: "1",
    promotion: "Promotion 1",
    startDate: "2026-01-01",
    endDate: "2026-01-02",
    category: "Category 1",
    product: "Product 1",
    discount: "10%",
    discountedPrice: "100",
    outlet: "Outlet 1",
    type: "Fixed",
  },
  {
    id: "2",
    promotion: "Promotion 2",
    startDate: "2026-01-01",
    endDate: "2026-01-02",
    category: "Category 2",
    product: "Product 2",
    discount: "20%",
    discountedPrice: "200",
    outlet: "Outlet 2",
    type: "Periodic",
  },
];

const Promotions = () => {
  const [filters, setFilters] = useState({
    id: "",
    promotion: "",
    product: "",
    category: "",
    outlet: "",
    type: "",
  });
  const [filteredPromotions, setFilteredPromotions] = useState([]);

  useEffect(() => {
    let filtered = [...promotionsData];
    if (filters.id) {
      filtered = filtered.filter((p) => p.id === filters.id);
    }

    // if (filters.type) {
    //   filtered = filtered.filter((p) => p.type === filters.type);
    // }

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.outlet) {
      filtered = filtered.filter((p) => p.outlet === filters.outlet);
    }

    if (filters.product) {
      filtered = filtered.filter((p) => p.product === filters.product);
    }

    setFilteredPromotions(filtered);
  }, [filters]);

  return (
    <div className="bg-background w-full h-full p-4">
      <h1 className="text-2xl font-bold text-gray-700">Promotions</h1>
      <div className="filters grid grid-cols-4 gap-2 mt-4">
        <Select
          options={[
            ...(promotionsData ?? [])
              .slice()
              .sort((a, b) =>
                String(a?.promotion ?? "").localeCompare(
                  String(b?.promotion ?? ""),
                  undefined,
                  { sensitivity: "base" }
                )
              )
              .map((p) => ({
                label: p.promotion,
                value: p.id,
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
      </div>
      <div className="table-container">
        <table className="w-full mt-4">
          <thead className="bg-linear-to-r from-primary to-secondary text-center">
            <tr>
              <th className="text-center p-2 text-white">Promotion</th>
              <th className="text-center p-2 text-white">Start Date</th>
              <th className="text-center p-2 text-white">End Date</th>
              <th className="text-center p-2 text-white">Category</th>
              <th className="text-center p-2 text-white">Product</th>
              <th className="text-center p-2 text-white">Discount (%)</th>
              <th className="text-center p-2 text-white">Discounted Price</th>
              <th className="text-center p-2 text-white">Outlet</th>
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
            {filteredPromotions.map((promotion) => (
              <tr key={promotion.id} className="even:bg-button-background">
                <td className="p-2">{promotion.promotion}</td>
                <td className="p-2">{promotion.startDate}</td>
                <td className="p-2">{promotion.endDate}</td>
                <td className="p-2">{promotion.category}</td>
                <td className="p-2">{promotion.product}</td>
                <td className="p-2">{promotion.discount}</td>
                <td className="p-2">{promotion.discountedPrice}</td>
                <td className="p-2">{promotion.outlet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promotions;
