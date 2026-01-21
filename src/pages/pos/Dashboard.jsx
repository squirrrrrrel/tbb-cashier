import React from "react";
import Cart from "../../components/pos/dashboard/Cart";
import Header from "../../components/pos/dashboard/Header";
import { useProductStore } from "../../store/useProductStore";
import OfflineLoader from "../../components/OfflineLoader";
import { useEffect } from "react";
import { useState } from "react";
import ProductComp from "../../components/pos/dashboard/ProductComp";


const Dashboard = () => {
  const { products, hydrate, hydrated } = useProductStore();
  const [filters, setFilters] = useState({
    barcode: "",
    product: "",
    category: "all",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productListLength = filteredProducts.length;
  const [cartProducts, setCartProducts] = useState([]);
  const [mute, setMute] = useState(false)

  useEffect(() => {
    let filtered = [...products];
    // if (filters.id) {
    //   filtered = filtered.filter((p) => p.id === filters.id);
    // }

    if (filters.category) {
      filtered = filtered.filter(
        (p) => p.categoryName.toLowerCase() === filters.category.toLowerCase()
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
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <OfflineLoader />;
  }
  return (
    <div className="flex">
      <div className="home w-3/5 bg-background">
        <div className="header">
          <Header
            filters={filters}
            setFilters={setFilters}
            productListLength={productListLength}
            mute={mute}
            setMute={setMute}
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
                id={p.id}
                img={p.img}
                name={p.name}
                price={p.price}
                unit={p.unit}
                stock={p.stock}
                stockQueue={p.stockQueue}
                isLowStock={p.isLowStock}
                setCartProducts={setCartProducts}
                mute={mute}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-2/5 h-screen">
        <Cart cartProducts={cartProducts} setCartProducts={setCartProducts}/>
      </div>
    </div>
  );
};

export default Dashboard;