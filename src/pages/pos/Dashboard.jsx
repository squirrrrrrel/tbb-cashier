import React, { use } from "react";
import Cart from "../../components/pos/dashboard/Cart";
import Header from "../../components/pos/dashboard/Header";
import { useProductStore } from "../../store/useProductStore";
import OfflineLoader from "../../components/OfflineLoader";
import { useEffect } from "react";
import { useState } from "react";
import ProductComp from "../../components/pos/dashboard/ProductComp";
import { Payment } from "../../components/pos/dashboard/Payment";
import { useNotification } from "../../hooks/useNotification";
import { useCartStore } from "../../store/useCartStore";
import PrintOrder from "../../components/pos/dashboard/PrintOrder";
import PhoneInputWithCode from "../../components/phoneCodeInput/PhoneInputWithCode";
import DashboardPopup from "../../components/pos/dashboard/dashboardPopup";


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
  const [payToProceed, setPayToProceed] = useState(false);
  const { notifyError, notifySuccess } = useNotification();
  const [activePopup, setActivePopup] = useState(null); // 'receipt', 'customer', or null
  const [orderId, setOrderId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phoneCode: { value: "+91" }, phone: '' });
  const { orderData, setOrderData } = useCartStore();
  const [isPrinting, setIsPrinting] = useState(false);
  const { cartData, setCartData, resetCart } = useCartStore();

  // 1️⃣ Restore from store
  useEffect(() => {
    if (cartData && cartData.length > 0) {
      setCartProducts(cartData);
    }
  }, []);

  // 2️⃣ Sync local → store
  useEffect(() => {
    if (cartProducts.length > 0) {
      setCartData(cartProducts);
    }
  }, [cartProducts]);

  // Function to trigger the flow
  const openPaySuccess = (id) => {
    setOrderId(id);
    setActivePopup('receipt');
  };

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

  const saveHoldOrder = (waiterName) => {
    console.log(` Waiter's Name: ${waiterName}, cartData ${cartProducts}`);
  }

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePay = (data) => {
    try {
      setOrderData({ ...data, orderId: "5468" });
      console.log(orderData);
      openPaySuccess(orderData.orderId ? data.orderId : "5467");
      notifySuccess("Payment Successfull");
    } catch (error) {
      console.log(error);
      notifyError("payment Unsuccessfull")
    }

  }

  const calculateSubtotal = () => {
    return cartProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = 0; // Can be calculated later if needed
  const discount = 0; // Can be calculated later if needed
  const total = subtotal + tax - discount;

  return (
    <div className="flex">
      <div className="home w-3/5 bg-background">
        {payToProceed ? (
          <Payment setPayToProceed={setPayToProceed} total={total} onPay={handlePay} tax={tax} discount={discount} subtotal={subtotal} cartProducts={cartProducts} />
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className="w-2/5 h-screen">
        <Cart cartProducts={cartProducts} setCartProducts={setCartProducts} onHoldOrder={saveHoldOrder} setPayToProceed={setPayToProceed} subtotal={subtotal} tax={tax} discount={discount} total={total} />
      </div>
      <DashboardPopup
        activePopup={activePopup}
        setActivePopup={setActivePopup}
        orderId={orderId}
        isPrinting={isPrinting}
        setIsPrinting={setIsPrinting}
        orderData={orderData}
        customerDetails={customerDetails}
        setCustomerDetails={setCustomerDetails}
        handleCustomerChange={handleCustomerChange}
        resetCart={resetCart}
        setCartProducts={setCartProducts}
        setPayToProceed={setPayToProceed}
      />
    </div>
  );
};

export default Dashboard;