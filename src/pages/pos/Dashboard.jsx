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
import { fetchOrdersFromAPI } from "../../utils/fetchOrdersFromAPI";
// import Retail from "./Retail";
import Retail from "./Retail";
import { useRetail } from "../../hooks/useRetail";
import { useAuthStore } from "../../store/useAuthStore";
import { usePromotionStore } from "../../store/usePromotionStore";
import PettyCash from "../../components/pos/dashboard/PettyCash";
import api from "../../utils/api";
import { useSocket } from "../../socket/SocketProvider";

const Dashboard = () => {
  const socket = useSocket();

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
  const [tick, setTick] = useState(0); // Ticker for live promo updates
  const [payToProceed, setPayToProceed] = useState(false);
  const { notifyError, notifySuccess } = useNotification();
  const [activePopup, setActivePopup] = useState(null); // 'receipt', 'customer', or null
  const [orderId, setOrderId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phoneCode: { value: "+91" }, phone: '' });
  // const { orderData, setOrderData } = useCartStore();
  const orderData = useCartStore(state => state.orderData);
  const setOrderData = useCartStore(state => state.setOrderData);
  const productStore = useProductStore.getState();

  const [isPrinting, setIsPrinting] = useState(false);
  const { cartData, setCartData, resetCart, selectedCustomer, selectedTable, addToCart, managerDiscount } = useCartStore();
  const { isRetail, isRetailOpen } = useRetail();
  const [isPettyClicked, setIsPettyClicked] = useState(false)

  const scanToCart = (barcode) => {
    const trimmed = (barcode || "").trim();
    if (!trimmed) return;
    const product = products.find((p) => (p.barcode || "").toString() === trimmed);
    if (!product) {
      setFilters((prev) => ({ ...prev, product: "" }));
      console.log("No product Added using Barcode");
      return;
    }
    if (
      product.categoryName?.toLowerCase() === "shots" ||
      product.categoryName?.toLowerCase() === "butchery"
    ) {
      return;
    }
    const price = getFinalProductPrice({
      product,
      promotions,
      outletId,
    });
    const itemDiscount = price < product.sellingPrice ? product.sellingPrice - price : 0;
    addToCart({
      id: product.serverId,
      img: product.img,
      name: product.name,
      price,
      originalPrice: product.sellingPrice,
      discount: itemDiscount,
      unit: product.unit,
      stock: product.stock,
      stockQueue: product.stockQueue ?? 0,
      categoryName: product.categoryName,
      quantity: 1,
    });
    setFilters((prev) => ({ ...prev, product: "" }));
  };

  //promotions
  const user = useAuthStore(state => state.user);
  const outletId = user?.outlet_id;
  const { promotions, hydrate: promoHydrate, hydrated: promoHydarated } = usePromotionStore();

  // condition for open the retail section
  const whenToOpenRetail = payToProceed ? false : (isRetail || isRetailOpen);


  // // 1️⃣ Restore from store
  // useEffect(() => {
  //   if (cartData && cartData.length > 0) {
  //     setCartProducts(cartData);
  //   }
  // }, []);

  // Sync cart prices when promotions change or time passes
  useEffect(() => {
    if (!hydrated || !promoHydarated || cartData.length === 0) return;

    let hasChanged = false;
    const updatedCart = cartData.map((item) => {
      const product = products.find((p) => p.serverId === item.id);
      if (!product) return item;

      const newPrice = getFinalProductPrice({
        product,
        promotions,
        outletId,
      });

      const calculatedPrice = Number(newPrice);
      const currentPrice = Number(item.price);

      if (Math.abs(calculatedPrice - currentPrice) > 0.001) {
        hasChanged = true;
        const basePrice = item.originalPrice || product.sellingPrice;
        const itemDiscount = calculatedPrice < basePrice ? (basePrice - calculatedPrice) : 0;

        console.log(`[Sync] Updating Cart Item: ${item.name} | ${currentPrice} -> ${calculatedPrice}`);
        return {
          ...item,
          price: calculatedPrice,
          discount: itemDiscount,
        };
      }
      return item;
    });

    if (hasChanged) {
      setCartData(updatedCart);
    }
  }, [tick, promotions, products, hydrated, promoHydarated, outletId, cartData]); // Using cartData instead of length for full sync

  // Update tick every 5 seconds for "Live" accuracy
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (!socket) return;

    const handleOrderRefresh = (payload) => {
      if (payload?.type !== "REFETCH_STOCK_LIST_FOR_CASHIER") return;

      useProductStore.getState().fetchProductsFromAPI();
    };

    const handlePromotionRefresh = (payload) => {
      console.log("Promotion change detected:", payload.source);
      // Refresh the promotion store
      usePromotionStore.getState().fetchPromotionsFromAPI();
    }

    socket.on("purchase:product", handleOrderRefresh);
    socket.on("promotion:refresh", handlePromotionRefresh);

    return () => {
      socket.off("purchase:product", handleOrderRefresh);
      socket.off("promotion:refresh", handlePromotionRefresh);
    };
  }, [socket]);

useEffect(() => {
    let filtered = [...products];

    // Category Filter
    if (filters.category) {
      filtered = filtered.filter(
        (p) => p.categoryName?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Product/Search Filter
    if (filters.product) {
      const q = filters.product.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode != null &&
            p.barcode.toString().toLowerCase().includes(q))
      );
    }

    // --- NEW: Alphabetical Sorting ---
    filtered.sort((a, b) => {
      // localeCompare is the safest way to sort strings (handles case and accents)
      return a.name.localeCompare(b.name);
    });

    setFilteredProducts(filtered);
  }, [filters, products, hydrate, tick, promotions]);
  useEffect(() => {
    hydrate();
    promoHydrate();
  }, [hydrate, promoHydrate]);

  useEffect(() => {
    console.log("✅ orderData updated:", orderData);
  }, [orderData]);

  if (!hydrated || !promoHydarated) {
    return <OfflineLoader />;
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
        totals: {
          subtotal,
          tax,
          discount: subtotal * discountRate,
          discount_percentage: discountRate * 100,
          total
        },
        paymentMethods: finalOrderData?.paymentMethods || [],
        tenderedAmount: finalOrderData?.tenderedAmount || 0,
        cashReturned: finalOrderData?.cashReturned || 0,
      });
      if (result.mode === "online") {
        setOrderData(result.order);
        openPaySuccess(result.order.display_id || result.order.displayId);
        notifySuccess(
          result.mode === "online"
            ? "Order created successfully"
            : "Order saved offline"
        );
        await Promise.all([
          fetchOrdersFromAPI(),
          productStore.fetchProductsFromAPI()
        ]);
      } else {
        setOrderData(
          {
            ...result.order,
            customer: selectedCustomer,
          }
        );
        openPaySuccess(result.order.display_id);
      }
      resetCart();
      setPayToProceed(false);
    } catch (err) {
      notifyError("Order failed");
      console.error("Error creating order:", err);
    }
  };
  const subtotal = cartData.reduce(
    (sum, p) => p.unit === "ml"
      ? sum + Number(p.price || 0) * Number(p.quantity || 1) * (p.shots || 1)
      : sum + Number(p.price || 0) * Number(p.quantity || 1),
    0
  );
  const discount = managerDiscount;
  // discountRate is always 0–1 (fraction of subtotal to remove)
  const discountRate = discount < 1 ? discount : (subtotal > 0 ? discount / subtotal : 0);
  // Tax is calculated on the discounted price per item
  const tax = cartData.reduce((totalTax, item) => {
    const taxPercent = Number(item.tax || 0);
    const itemTotal = item.unit === "ml"
      ? Number(item.price || 0) * Number(item.quantity || 1) * (item.shots || 1)
      : Number(item.price || 0) * Number(item.quantity || 1);
    const discountedItemTotal = itemTotal * (1 - discountRate);
    return totalTax + (discountedItemTotal * taxPercent) / 100;
  }, 0);
  const discountedSubtotal = subtotal * (1 - discountRate);
  const total = discountedSubtotal + tax;


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
      const match = includesId(promo.product, product.serverId);
      // if (!match) console.log(`[Scope Bypass] Product ID mismatch: ${product.serverId} not in ${promo.product}`);
      return match;
    }

    // CATEGORY promo
    if (promo.promo_on === "CATEGORY") {
      const match = includesId(promo.category, product.categoryId);
      // if (!match) console.log(`[Scope Bypass] Category ID mismatch: ${product.categoryId} not in ${promo.category}`);
      return match;
    }

    return false;
  };


  // const isScheduleValid = (promo, now) => {
  //   const jsDay = now.getDay();
  //   const currentDay = jsDay === 0 ? 7 : jsDay; // Sunday: 0→7, Mon–Sat: 1–6 stay
  //   const currentTime = now.toTimeString().slice(0, 5); // HH:mm
  //   const currentDate = now.toISOString().split('T')[0];

  //   /* -------- DAILY -------- */
  //   if (promo.schedule_type === 'DAILY') {
  //     return isTimeAllowed(promo, currentTime);
  //   }

  //   /* -------- WEEKLY -------- */
  //   if (promo.schedule_type === 'WEEKLY') {
  //     if (
  //       promo.schedule_start_day == null ||
  //       promo.schedule_end_day == null
  //     ) return false;

  //     if (!isDayBetween(currentDay, promo.schedule_start_day, promo.schedule_end_day)) {
  //       return false;
  //     }

  //     return isTimeAllowed(promo, currentTime);
  //   }

  //   /* -------- DATE RANGE -------- */
  //   if (promo.schedule_type === 'DATE_RANGE') {
  //     if (
  //       !promo.schedule_start_date ||
  //       !promo.schedule_end_date
  //     ) return false;

  //     if (
  //       currentDate < promo.schedule_start_date ||
  //       currentDate > promo.schedule_end_date
  //     ) return false;

  //     return isTimeAllowed(promo, currentTime);
  //   }

  //   return false;
  // };

  // const isTimeAllowed = (promo, currentTime) => {
  //   if (promo.schedule_mode === 'ALWAYS') return true;

  //   if (promo.schedule_mode === 'FULL_DAY') {
  //     return true; // 00:00 → 23:59
  //   }

  //   if (promo.schedule_mode === 'TIME_RANGE') {
  //     if (!promo.schedule_start_time || !promo.schedule_end_time) {
  //       return false;
  //     }

  //     // Overnight support
  //     if (promo.schedule_start_time <= promo.schedule_end_time) {
  //       return (
  //         currentTime >= promo.schedule_start_time &&
  //         currentTime <= promo.schedule_end_time
  //       );
  //     }

  //     // Overnight (22:00 → 06:00)
  //     return (
  //       currentTime >= promo.schedule_start_time ||
  //       currentTime <= promo.schedule_end_time
  //     );
  //   }

  //   return false;
  // };

  const isScheduleValid = (promo, now) => {
    const jsDay = now.getDay();
    const currentDay = jsDay === 0 ? 7 : jsDay; // Mon:1, Tue:2 ... Sun:7
    const yesterdayDay = currentDay === 1 ? 7 : currentDay - 1;

    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    // 1. Midnight Timestamps for Date Range
    const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayAtMidnight = todayAtMidnight - (24 * 60 * 60 * 1000);

    const parseToMidnight = (dateStr) => {
      if (!dateStr) return 0;
      // Force local midnight by parsing components
      const parts = typeof dateStr === 'string' ? dateStr.split("T")[0].split("-") : [];
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      }
      const d = new Date(dateStr);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    // Helper to check if a promotion is configured to be overnight
    const startForConfig = (promo.schedule_start_time || "00:00").slice(0, 5);
    const endForConfig = (promo.schedule_end_time || "00:00").slice(0, 5);
    const isOvernightConfig = promo.schedule_mode === 'TIME_RANGE' && startForConfig > endForConfig;

    /* -------- DAILY -------- */
    if (promo.schedule_type === 'DAILY') {
      return isTimeAllowed(promo, currentTime);
    }

    /* -------- WEEKLY -------- */
    if (promo.schedule_type === 'WEEKLY') {
      if (promo.schedule_start_day == null || promo.schedule_end_day == null) return false;

      const endLimit = (promo.schedule_end_time || "00:00").slice(0, 5);
      // If it's early morning and the promo is overnight, check if YESTERDAY was a valid promo day
      if (isOvernightConfig && currentTime <= endLimit) {
        if (!isDayBetween(yesterdayDay, promo.schedule_start_day, promo.schedule_end_day)) {
          // console.log(`[Schedule Bypass] Weekly Day mismatch (Yesterday): ${yesterdayDay}`);
          return false;
        }
      } else {
        // Otherwise, check if TODAY is a valid promo day
        if (!isDayBetween(currentDay, promo.schedule_start_day, promo.schedule_end_day)) {
          // console.log(`[Schedule Bypass] Weekly Day mismatch (Today): ${currentDay}`);
          return false;
        }
      }

      return isTimeAllowed(promo, currentTime);
    }

    /* -------- DATE RANGE -------- */
    if (promo.schedule_type === 'DATE_RANGE') {
      if (!promo.schedule_start_date || !promo.schedule_end_date) return false;

      const startTimestamp = parseToMidnight(promo.schedule_start_date);
      const endTimestamp = parseToMidnight(promo.schedule_end_date);
      const endLimit = (promo.schedule_end_time || "00:00").slice(0, 5);

      if (isOvernightConfig && currentTime <= endLimit) {
        // Check if yesterday was within the date range
        if (!(yesterdayAtMidnight >= startTimestamp && yesterdayAtMidnight <= endTimestamp)) {
          console.log(`[Schedule Bypass] Date mismatch (Yesterday): ${new Date(yesterdayAtMidnight).toDateString()}`);
          return false;
        }
      } else {
        // Check if today is within the date range
        if (!(todayAtMidnight >= startTimestamp && todayAtMidnight <= endTimestamp)) {
          console.log(`[Schedule Bypass] Date mismatch (Today): ${new Date(todayAtMidnight).toDateString()}`);
          return false;
        }
      }

      return isTimeAllowed(promo, currentTime);
    }

    return false;
  };

  const isTimeAllowed = (promo, currentTime) => {
    if (promo.schedule_mode === 'ALWAYS' || promo.schedule_mode === 'FULL_DAY') return true;

    if (promo.schedule_mode === 'TIME_RANGE') {
      const start = (promo.schedule_start_time || "00:00").slice(0, 5);
      const end = (promo.schedule_end_time || "23:59").slice(0, 5);

      if (start <= end) {
        return currentTime >= start && currentTime <= end;
      }
      // Overnight: 22:00 to 04:00
      return currentTime >= start || currentTime <= end;
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
    promotions: manualPromos,
    outletId: manualOutletId,
  }) => {
    const activePromos = manualPromos ?? promotions;
    const activeOutletId = manualOutletId ?? outletId;
    if (!product) {
      console.warn("⚠️ Product missing at pricing stage");
      return product?.sellingPrice ?? 0;
    }

    const now = new Date();

    const applicablePromos = activePromos.filter(
      (p) => {
        // Robust is_active check
        const activeProp = p.is_active;
        const isActive = activeProp !== false &&
          activeProp !== 0 &&
          activeProp !== "0" &&
          String(activeProp).toLowerCase() !== "false";

        if (!isActive) return false;

        const match = isScopeValid(p, activeOutletId, product) &&
          isScheduleValid(p, now);

        if (match) {
          console.log(`%c [Live Match!] ${p.promotion_name} (ID: ${p.serverId}) at ${now.toLocaleTimeString()}`, "color: #00ff00; font-weight: bold;");
        }
        return match;
      }
    );

    if (!applicablePromos.length) {
      return product.sellingPrice;
    }

    const bestPromo = selectBestPromotion(applicablePromos);

    return applyPromotion(product.sellingPrice, bestPromo);
  };

  //whats app
  const handleWhatsApp = async () => {
    try {
      // To safely concatenate phone code and phone number, ensure both exist, then fallback if missing.
      let finalphone =
        orderData?.customer?.phone_code && orderData?.customer?.phone_number
          ? `${orderData.customer.phone_code}${orderData.customer.phone_number}`
          : `${customerDetails.phoneCode?.value ?? ""}${customerDetails.phone ?? ""}`;

      let customerName =
        orderData?.customer?.first_name && orderData?.customer?.last_name
          ? `${orderData.customer.first_name} ${orderData.customer.last_name}`
          : customerDetails.name || "Customer";
      finalphone = finalphone.trim().replace(/\D/g, ""); // keep digits only

      if (!finalphone) return;

      if (finalphone.length < 10) {
        alert("Invalid phone number. Please enter with country code.");
        return;
      }

      const {
        cashierName = "Cashier",
        display_id,
        order_date,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        orderItems = [],
      } = orderData;

      const formattedDate = new Date(order_date).toLocaleString();
      const productLines = orderItems
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.product.product_name} x ${item.quantity || 0
            } = ${item.total_amount.toLocaleString("en-IN")}`
        )
        .join("\n");

      // WhatsApp message template
      const message = `Hello ${customerName},

Thank you for shopping with us! 
Your order has been placed successfully.

*Order Invoice Details*  
Customer: ${customerName}
Phone: +${finalphone}
Order No: ${display_id}  
Date: ${formattedDate}  
Cashier: ${cashierName}  

*Items:*  
${productLines || "No items"}  

Subtotal: ${Number(subtotal).toLocaleString("en-IN")}  
Tax: ${Number(tax_amount).toLocaleString("en-IN")}  
Discount: ${Number(discount_amount).toLocaleString("en-IN")}  
--------------------  
*Total: ${Number(total_amount).toLocaleString("en-IN")}*  

We truly appreciate your trust in us.  
Hope to see you again soon!  
- Team QKarts`;

      // Send the message through backend
      const res = await api.post("/tenant/whatsapp/send", {
        // event_key: "ORDER_PLACED",
        phone: finalphone,
        message: message,
      },
        // {
        //   headers: {
        //     "x-tenant-id": orderData.tenant_id,
        //   },
        // }
      );

      if (res?.data?.success) {
        notifySuccess("WhatsApp message sent successfully!");
        setActivePopup("receipt")
        setCustomerDetails({ name: '', phoneCode: { value: "+91" }, phone: '' })
      } else {
        notifyError(
          "Failed to send WhatsApp message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      notifyError(
        <>Whats App is not connected or Something <br />  went wrong while sending the message!</>
      );
    }
  };


  return (
    <div className="flex overflow-x-hidden">
      <div className="home flex-grow bg-background flex flex-col h-screen p-3 gap-2">
        {payToProceed ? (
          <Payment setPayToProceed={setPayToProceed} total={parseFloat(total).toFixed(2)} onPay={handlePay} tax={parseFloat(tax).toFixed(2)} discount={parseFloat(discount).toFixed(2)} subtotal={parseFloat(subtotal).toFixed(2)} cartProducts={cartData} />
        ) : (
          <>
            <div className="header">
              <Header
                filters={filters}
                setFilters={setFilters}
                productListLength={productListLength}
                mute={mute}
                setMute={setMute}
                scanToCart={scanToCart}
                isPettyClicked={isPettyClicked}
                setIsPettyClicked={setIsPettyClicked}
              />
            </div>
            <div className="product-list-container flex-1 overflow-y-auto no-scrollbar">
              <div
                className="product-list"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "16px", // Consistent gap between cards
                  alignItems: "start", // Prevent vertical stretch
                  justifyItems: "center",
                  boxSizing: "border-box",
                }}
              >
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-700">
                    <span className="text-5xl mb-3">⚠️</span>
                    <p className="text-2xl font-medium">No product found</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const price = getFinalProductPrice({
                      product: p,
                      promotions,
                      outletId,
                    });
                    const discount = price < p.sellingPrice ? p.sellingPrice - price : 0
                    return (
                      <ProductComp
                        key={p.serverId ?? p.localId}
                        id={p.serverId}
                        img={p.img}
                        name={p.name}
                        price={price}
                        originalPrice={p.sellingPrice}
                        discount={discount}
                        unit={p.unit}
                        stock={p.stock}
                        barcode={p.barcode}
                        stockQueue={p.stockQueue}
                        categoryName={p.categoryName}
                        mute={mute}
                        tax={p.tax}
                        lowStockThreshold={p.lowStockThreshold}
                        isautoFill={p.isautoFillVolumeDetails}
                        shotsvolumeml={p.shotsvolumeml}
                        shotsperbottel={p.shotsperbottel}
                        // Pass discount+originalPrice into addToCart via ProductComp
                        extraCartFields={{ originalPrice: p.sellingPrice, discount }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="w-[35vw] h-screen">
        {/* <Cart cartProducts={cartProducts} setCartProducts={setCartProducts} onHoldOrder={saveHoldOrder} setPayToProceed={setPayToProceed} subtotal={subtotal} tax={tax} discount={discount} total={total} /> */}
        <Cart
          setPayToProceed={setPayToProceed}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          total={total}
        />
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
        handleWhatsApp={handleWhatsApp}
      />
      {whenToOpenRetail &&
        <Retail
          setPayToProceed={setPayToProceed}
          getFinalProductPrice={getFinalProductPrice}
          setIsPettyClicked={setIsPettyClicked}
          mute={mute}
          setMute={setMute}
        />
      }
      {isPettyClicked && <PettyCash setIsPettyClicked={setIsPettyClicked} />}
    </div>
  );
};

export default Dashboard;