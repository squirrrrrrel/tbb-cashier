import React from "react";
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
import { createOfflineOrder } from "../../utils/createOfflineOrder";
import { createOrder } from "../../utils/createOrder";
import Retail from "./Retail";
import { useAuthStore } from "../../store/useAuthStore";
import { usePromotionStore } from "../../store/usePromotionStore";

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
  const { cartData, setCartData, resetCart, selectedCustomer, selectedTable } = useCartStore();
  const [isRetail, setIsRetail] = useState(false);

  //promotions
  const outletId = useAuthStore.getState().user?.outlet_id;
  const { promotions, hydrate: promoHydrate, hydrated: promoHydarated } = usePromotionStore();

  // // 1️⃣ Restore from store
  // useEffect(() => {
  //   if (cartData && cartData.length > 0) {
  //     setCartProducts(cartData);
  //   }
  // }, []);

  // // 2️⃣ Sync local → store
  // useEffect(() => {
  //   if (cartProducts.length > 0) {
  //     setCartData(cartProducts);
  //   }
  // }, [cartProducts]);

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
  }, [filters, products, hydrate]);
  useEffect(() => {
    hydrate();
    promoHydrate();
  }, [hydrate, promoHydrate]);

  if (!hydrated || !promoHydarated) {
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

  const handlePay = async (finalOrderData) => {

    try {
      const result = await createOrder({
        cartData,
        customer: selectedCustomer || null,
        table: selectedTable || null,
        totals: { subtotal, tax, discount, total },
        paymentMethods: finalOrderData?.paymentMethods || [],
        tenderedAmount: finalOrderData?.tenderedAmount || 0,
        cashReturned: finalOrderData?.cashReturned || 0,
      });

      setOrderData(result.order);
      openPaySuccess(result.orderId);

      notifySuccess(
        result.mode === "online"
          ? "Order created successfully"
          : "Order saved offline"
      );
      resetCart();
      //setPayToProceed(false);
    } catch (err) {
      notifyError("Order failed");
      console.error("Error creating order:", err);
    }
  };

  const subtotal = cartData.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );

  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;


  //promotion functions
  const normalizeId = (v) => (v == null ? "" : String(v));
  const includesId = (arr, id) => {
    if (!Array.isArray(arr) || !arr.length) return false;
    const needle = normalizeId(id);
    return arr.some((x) => normalizeId(x) === needle);
  };

  const isScopeValid = (promo, outletId, product) => {
    // Outlet
    if (Array.isArray(promo.outlet) && promo.outlet.length && !includesId(promo.outlet, outletId)) {
      return false;
    }

    // PRODUCT promo
    if (promo.promo_on === "PRODUCT") {
      return includesId(promo.product, product.serverId);
    }

    // CATEGORY promo
    if (promo.promo_on === "CATEGORY") {
      return includesId(promo.category, product.categoryId);
    }

    return false;
  };


  const isScheduleValid = (promo, now) => {
    const currentDay = now.getDay(); // 0–6
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm
    const currentDate = now.toISOString().split('T')[0];

    /* -------- DAILY -------- */
    if (promo.schedule_type === 'DAILY') {
      return isTimeAllowed(promo, currentTime);
    }

    /* -------- WEEKLY -------- */
    if (promo.schedule_type === 'WEEKLY') {
      if (
        promo.schedule_start_day == null ||
        promo.schedule_end_day == null
      ) return false;

      if (!isDayBetween(currentDay, promo.schedule_start_day, promo.schedule_end_day)) {
        return false;
      }

      return isTimeAllowed(promo, currentTime);
    }

    /* -------- DATE RANGE -------- */
    if (promo.schedule_type === 'DATE_RANGE') {
      if (
        !promo.schedule_start_date ||
        !promo.schedule_end_date
      ) return false;

      if (
        currentDate < promo.schedule_start_date ||
        currentDate > promo.schedule_end_date
      ) return false;

      return isTimeAllowed(promo, currentTime);
    }

    return false;
  };

  const isTimeAllowed = (promo, currentTime) => {
    if (promo.schedule_mode === 'ALWAYS') return true;

    if (promo.schedule_mode === 'FULL_DAY') {
      return true; // 00:00 → 23:59
    }

    if (promo.schedule_mode === 'TIME_RANGE') {
      if (!promo.schedule_start_time || !promo.schedule_end_time) {
        return false;
      }

      // Overnight support
      if (promo.schedule_start_time <= promo.schedule_end_time) {
        return (
          currentTime >= promo.schedule_start_time &&
          currentTime <= promo.schedule_end_time
        );
      }

      // Overnight (22:00 → 06:00)
      return (
        currentTime >= promo.schedule_start_time ||
        currentTime <= promo.schedule_end_time
      );
    }

    return false;
  };

  const isDayBetween = (cur, start, end) => {
    if (start <= end) return cur >= start && cur <= end;
    return cur >= start || cur <= end; // Fri → Mon
  };

  const selectBestPromotion = (promotions) => {
    return promotions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
  };

  const applyPromotion = (price, promo) => {
    if (!promo) return price;

    if (promo.type === "FREE") return 0;

    // Treat type === "HIKE" as price increase, everything else as discount
    const isHike = promo.type === "HIKE";

    if (promo.mode === "PERCENT") {
      const delta = (price * Number(promo.value || 0)) / 100;
      const newPrice = isHike ? price + delta : price - delta;
      return Math.max(newPrice, 0);
    }

    if (promo.mode === "FLAT") {
      const delta = Number(promo.value || 0);
      const newPrice = isHike ? price + delta : price - delta;
      return Math.max(newPrice, 0);
    }

    return price;
  };


  const getFinalProductPrice = ({
    product,
    promotions = [],
    outletId,
  }) => {
    if (!product) {
      console.warn("⚠️ Product missing at pricing stage");
      return product?.sellingPrice ?? 0;
    }

    const now = new Date();

    const applicablePromos = promotions.filter(
      (p) =>
        p.is_active !== false &&
        isScopeValid(p, outletId, product) &&
        isScheduleValid(p, now)
    );

    if (!applicablePromos.length) {
      return product.sellingPrice;
    }

    const bestPromo = selectBestPromotion(applicablePromos);

    return applyPromotion(product.sellingPrice, bestPromo);
  };



  return (
    <div className="flex">
      <div className="home w-3/5 bg-background">
        {payToProceed ? (
          <Payment setPayToProceed={setPayToProceed} total={total} onPay={handlePay} tax={tax} discount={discount} subtotal={subtotal} cartProducts={cartData} />
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
                {filteredProducts.map((p) => {
                  const price = getFinalProductPrice({
                    product: p,
                    promotions,
                    outletId,
                  });
                  return (
                    <ProductComp
                      key={p.serverId ?? p.localId}
                      id={p.serverId}
                      img={p.img}
                      name={p.name}
                      price={price}
                      unit={p.unit}
                      stock={p.stock}
                      stockQueue={p.stockQueue}
                      isLowStock={p.isLowStock}
                      categoryName={p.categoryName}
                      mute={mute}
                      originalPrice={p.sellingPrice}
                    />
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="w-2/5 h-screen">
        {/* <Cart cartProducts={cartProducts} setCartProducts={setCartProducts} onHoldOrder={saveHoldOrder} setPayToProceed={setPayToProceed} subtotal={subtotal} tax={tax} discount={discount} total={total} /> */}
        <Cart
          onHoldOrder={saveHoldOrder}
          setPayToProceed={setPayToProceed}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          total={total}
          isRetail={isRetail}
          setIsRetail={setIsRetail}
        />
      </div>
      <DashboardPopup
        activePopup={activePopup}
        setActivePopup={setActivePopup}
        orderId={orderId}
        isPrinting={isPrinting}
        setIsPrinting={setIsPrinting}
        orderData={cartData}
        customerDetails={customerDetails}
        setCustomerDetails={setCustomerDetails}
        handleCustomerChange={handleCustomerChange}
        resetCart={resetCart}
        setCartProducts={setCartProducts}
        setPayToProceed={setPayToProceed}
      />
      {isRetail &&
        <Retail
          setIsRetail={setIsRetail}
        />
      }
    </div>
  );
};

export default Dashboard;