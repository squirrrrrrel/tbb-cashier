import React from "react";
import Cart from "../../components/pos/dashboard/Cart";
import Header from "../../components/pos/dashboard/Header";
import bottleImage from "../../assets/images/bottle.jpg";
import butcheryImage from "../../assets/images/butchery.png";
import shotsImage from "../../assets/images/shots.png";
import wineImage from "../../assets/images/wine.jpg";
import { useEffect } from "react";
import { useState } from "react";

const product = [
  {
    id: 1,
    img: butcheryImage,
    name: "Mature-Beef-Tenderloin-500g",
    price: "60.00",
    unit: "pkg",
    stock: "16",
    stockQueue: "12",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 2,
    img: butcheryImage,
    name: "Organic-Chicken-Drumsticks-1kg",
    price: "35.50",
    unit: "pkg",
    stock: "7",
    stockQueue: "25",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 3,
    img: butcheryImage,
    name: "Heritage-Pork-Chops-400g",
    price: "52.00",
    unit: "pkg",
    stock: "2",
    stockQueue: "6",
    isLowStock: true,
    category: "butchery",
  },
  {
    id: 4,
    img: wineImage,
    name: "Classic-Red-Wine-750ml",
    price: "110.00",
    unit: "btl",
    stock: "8",
    stockQueue: "23",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 5,
    img: wineImage,
    name: "Premium-White-Wine-1L",
    price: "120.75",
    unit: "btl",
    stock: "18",
    stockQueue: "8",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 6,
    img: wineImage,
    name: "Russian-Vodka-500ml",
    price: "60.00",
    unit: "btl",
    stock: "10",
    stockQueue: "28",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 7,
    img: butcheryImage,
    name: "Butcher's-Lamb-Cutlets-350g",
    price: "78.90",
    unit: "pkg",
    stock: "3",
    stockQueue: "8",
    isLowStock: true,
    category: "butchery",
  },
  {
    id: 8,
    img: butcheryImage,
    name: "Seared-Beef-Burger-Patties-300g",
    price: "29.99",
    unit: "pkg",
    stock: "13",
    stockQueue: "20",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 9,
    img: butcheryImage,
    name: "Smoky-BBQ-Sausages-200g",
    price: "25.00",
    unit: "pkg",
    stock: "11",
    stockQueue: "15",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 10,
    img: bottleImage,
    name: "Tequila-Silver-1L",
    price: "145.00",
    unit: "btl",
    stock: "6",
    stockQueue: "12",
    isLowStock: false,
    category: "All",
  },
  {
    id: 11,
    img: bottleImage,
    name: "Bourbon-Whiskey-700ml",
    price: "88.00",
    unit: "btl",
    stock: "4",
    stockQueue: "7",
    isLowStock: true,
    category: "All",
  },
  {
    id: 12,
    img: bottleImage,
    name: "Imported-Gin-750ml",
    price: "45.50",
    unit: "btl",
    stock: "18",
    stockQueue: "33",
    isLowStock: false,
    category: "All",
  },
  {
    id: 13,
    img: bottleImage,
    name: "Craft-Beer-Pale-Ale-500ml",
    price: "23.25",
    unit: "btl",
    stock: "29",
    stockQueue: "60",
    isLowStock: false,
    category: "All",
  },
  {
    id: 14,
    img: butcheryImage,
    name: "Butchery-Turkey-Whole-2kg",
    price: "120.00",
    unit: "pkg",
    stock: "9",
    stockQueue: "2",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 15,
    img: butcheryImage,
    name: "Raw-Shrimp-500g",
    price: "78.75",
    unit: "pkg",
    stock: "20",
    stockQueue: "25",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 16,
    img: butcheryImage,
    name: "Extra-Mature-Cheddar-200g",
    price: "26.95",
    unit: "pkg",
    stock: "30",
    stockQueue: "18",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 17,
    img: wineImage,
    name: "Rose-Wine-1L",
    price: "112.00",
    unit: "btl",
    stock: "16",
    stockQueue: "14",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 18,
    img: butcheryImage,
    name: "Butchery-Deli-Beef-Salami-150g",
    price: "12.20",
    unit: "pkg",
    stock: "18",
    stockQueue: "11",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 19,
    img: butcheryImage,
    name: "Duck-Breast-Fillet-400g",
    price: "50.00",
    unit: "pkg",
    stock: "0",
    stockQueue: "3",
    isLowStock: true,
    category: "butchery",
  },
  {
    id: 20,
    img: wineImage,
    name: "Vanilla-Flavored-Vodka-1L",
    price: "73.50",
    unit: "btl",
    stock: "7",
    stockQueue: "10",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 21,
    img: bottleImage,
    name: "Rum-Reserve-500ml",
    price: "54.50",
    unit: "btl",
    stock: "8",
    stockQueue: "13",
    isLowStock: false,
    category: "All",
  },
  {
    id: 22,
    img: butcheryImage,
    name: "Butchery-Roast-Beef-1kg",
    price: "137.00",
    unit: "pkg",
    stock: "13",
    stockQueue: "6",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 23,
    img: wineImage,
    name: "Rosé-Champagne-750ml",
    price: "210.00",
    unit: "btl",
    stock: "9",
    stockQueue: "5",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 24,
    img: wineImage,
    name: "Cabernet-Merlot-1.5L",
    price: "175.00",
    unit: "btl",
    stock: "4",
    stockQueue: "2",
    isLowStock: true,
    category: "shots",
  },
  {
    id: 25,
    img: butcheryImage,
    name: "Butchery-Cured-Bacon-250g",
    price: "42.50",
    unit: "pkg",
    stock: "10",
    stockQueue: "20",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 26,
    img: wineImage,
    name: "Blueberry-Infused-Wine-750ml",
    price: "130.00",
    unit: "btl",
    stock: "3",
    stockQueue: "15",
    isLowStock: true,
    category: "shots",
  },
  {
    id: 27,
    img: butcheryImage,
    name: "Butchery-Lamb-Minced-500g",
    price: "44.00",
    unit: "pkg",
    stock: "5",
    stockQueue: "9",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 28,
    img: wineImage,
    name: "Chardonnay-Classic-750ml",
    price: "115.20",
    unit: "btl",
    stock: "14",
    stockQueue: "21",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 29,
    img: wineImage,
    name: "Triple-Distilled-Vodka-1.5L",
    price: "155.00",
    unit: "btl",
    stock: "18",
    stockQueue: "10",
    isLowStock: false,
    category: "shots",
  },
  {
    id: 30,
    img: bottleImage,
    name: "Dark-Rum-Gold-1L",
    price: "92.70",
    unit: "btl",
    stock: "11",
    stockQueue: "14",
    isLowStock: false,
    category: "All",
  },
  {
    id: 31,
    img: bottleImage,
    name: "Smoked-Salmon-Slices-200g",
    price: "36.00",
    unit: "pkg",
    stock: "9",
    stockQueue: "17",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 32,
    img: bottleImage,
    name: "Butchery-Steak-Sirloin-250g",
    price: "52.90",
    unit: "pkg",
    stock: "8",
    stockQueue: "11",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 33,
    img: bottleImage,
    name: "Italian-Gin-700ml",
    price: "85.00",
    unit: "btl",
    stock: "17",
    stockQueue: "18",
    isLowStock: false,
    category: "all",
  },
  {
    id: 34,
    img: bottleImage,
    name: "Butchery-Mutton-Stir-Fry-300g",
    price: "47.00",
    unit: "pkg",
    stock: "6",
    stockQueue: "8",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 35,
    img: bottleImage,
    name: "Butchery-Chicken-Breast-Skinless-1kg",
    price: "66.00",
    unit: "pkg",
    stock: "15",
    stockQueue: "17",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 36,
    img: shotsImage,
    name: "Champagne-Sparkling-Bottle-750ml",
    price: "195.00",
    unit: "btl",
    stock: "2",
    stockQueue: "4",
    isLowStock: true,
    category: "shots",
  },
  {
    id: 37,
    img: bottleImage,
    name: "Rum-Premium-700ml",
    price: "68.25",
    unit: "btl",
    stock: "20",
    stockQueue: "16",
    isLowStock: false,
    category: "All",
  },
  {
    id: 38,
    img: bottleImage,
    name: "Whiskey-Deluxe-1L",
    price: "130.00",
    unit: "btl",
    stock: "6",
    stockQueue: "9",
    isLowStock: false,
    category: "All",
  },
  {
    id: 39,
    img: bottleImage,
    name: "Butchery-Veal-Cutlets-500g",
    price: "89.50",
    unit: "pkg",
    stock: "5",
    stockQueue: "7",
    isLowStock: false,
    category: "butchery",
  },
  {
    id: 40,
    img: bottleImage,
    name: "Apple-Cider-500ml",
    price: "20.00",
    unit: "btl",
    stock: "12",
    stockQueue: "27",
    isLowStock: false,
    category: "All",
  },
];

const ProductComp = ({
  img,
  name,
  price,
  unit,
  stock,
  stockQueue,
  isLowStock,
}) => {
  return (
    <div className="product bg-white border border-gray-300 rounded-lg w-34 h-[260px] hover:border-secondary cursor-pointer">
      <img
        src={img}
        alt={name}
        style={{
          width: "136px",
          height: "136px",
          objectFit: "cover",
        }}
        className="rounded-t-lg border-b border-b-gray-300"
      />
      <div className="product-details p-2 flex h-[120px] items-center">
        <div className="flex flex-col gap-1">
          <h2
            className="text-sm text-gray-700"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
            title={name}
          >
            {name}
          </h2>
          <span className="text-sm text-secondary">
            {price} / {unit}
          </span>
          <span className="text-xs text-green-600">
            In Stock ({stock} {unit})
          </span>
          <span className="text-xs text-gray-700">
            + Stock ({stockQueue} {unit})
          </span>
        </div>
      </div>
      {isLowStock && (
        <div className="relative">
          <div
            className="low-stock-badge text-[8px] bg-red-100 rounded-full py-px px-2 absolute animate-pulse text-red-600"
            style={{ right: 8, bottom: 8, position: "absolute" }}
          >
            Low
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [filters, setFilters] = useState({
    barcode: "",
    product: "",
    category: "all",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productListLength = filteredProducts.length;

  useEffect(() => {
    let filtered = [...product];
    // if (filters.id) {
    //   filtered = filtered.filter((p) => p.id === filters.id);
    // }

    if (filters.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // if (filters.outlet) {
    //   filtered = filtered.filter((p) => p.outlet === filters.outlet);
    // }

    if (filters.product) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.product.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [filters]);
  return (
    <div className="flex">
      <div className="home w-3/5 bg-background">
        <div className="header">
          <Header
            filters={filters}
            setFilters={setFilters}
            productListLength={productListLength}
          />
        </div>
        <div className="product-list-container p-4">
          <div
            className="product-list overflow-scroll max-h-[calc(100vh-180px)] no-scrollbar"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "16px", // Consistent gap between cards
              alignItems: "start", // Prevent vertical stretch
              justifyItems: "center",
              boxSizing: "border-box",
            }}
          >
            {filteredProducts.map((p) => (
              <ProductComp
                key={p.id}
                img={p.img}
                name={p.name}
                price={p.price}
                unit={p.unit}
                stock={p.stock}
                stockQueue={p.stockQueue}
                isLowStock={p.isLowStock}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-2/5 h-screen">
        <Cart />
      </div>
    </div>
  );
};

export default Dashboard;
