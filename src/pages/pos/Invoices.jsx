import React, { useState, useEffect, useRef } from "react";
import InvoiceList from "../../components/pos/invoice/InvoiceList";
import InvoiceForm from "../../components/pos/invoice/InvoiceForm";
import HoldInvoiceList from "../../components/pos/invoice/HoldInvoiceList";
import HoldInvoiceFrom from "../../components/pos/invoice/HoldInvoiceForm";
import { useOrderStore } from "../../store/useOrderStore";
import { fetchOrdersFromAPI } from "../../utils/fetchOrdersFromAPI";
import { refundOrderAPI } from "../../api/refundApi";
import { exchangeOrderAPI } from "../../api/exchangeApi";
import { useHoldOrderStore } from "../../store/useHoldOrderStore";
import { useCartStore } from "../../store/useCartStore";
import { useCreditOrderStore } from "../../store/useCreditOrderStore";
import { usePaymentMethodStore } from "../../store/usePaymentMethodStore";
import { useAuthStore } from "../../store/useAuthStore";
import LoadingBar from "../../components/common/LoadingBar/LoadingBar";
const Invoices = () => {
  const [activeBtn, setActiveBtn] = useState("invoiceBTN");
  const { setCartFromHold } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [givenDate, setGivenDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const holdOrders = useHoldOrderStore(state => state.holdOrders);
  const loadHoldOrdersFromDB = useHoldOrderStore(
    state => state.loadHoldOrdersFromDB
  );
  const fetchHoldOrders = useHoldOrderStore(state => state.fetchHoldOrders);
  const { creditOrders, fetchCreditOrders, hydrate: hydrateCreditOrders } = useCreditOrderStore();
  const { paymentMethods, hydrate: hydratePaymentMethods } = usePaymentMethodStore();
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore(state => state.orders);
  const loadOrdersFromDB = useOrderStore(state => state.loadOrdersFromDB);
  const setOrders = useOrderStore(state => state.setOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const creditFetchedRef = useRef(false);

  // 🔹 Step 1: Hydrate payment methods once on mount
  useEffect(() => {
    hydratePaymentMethods();
  }, []);

  // 🔹 Step 2: Fetch credit orders once payment methods are loaded
  useEffect(() => {
    // Skip if already fetched or no payment methods yet
    if (creditFetchedRef.current || !paymentMethods.length) return;

    const creditMethod = paymentMethods.find(
      (m) => m.payment_method_name === "Credit" || m.display_name === "Credit"
    );

    if (navigator.onLine && user?.outlet_id && creditMethod?.id) {
      creditFetchedRef.current = true;
      (async () => {
        setIsLoading(true);
        try {
          await fetchCreditOrders(user.outlet_id, creditMethod.id);
          await hydrateCreditOrders();
        } catch (err) {
          console.error("Credit fetch failed:", err);
          creditFetchedRef.current = false; // allow retry on error
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [paymentMethods, user?.outlet_id]);
  // 🔹 Initial load: sync from API (if online) then hydrate from IndexedDB
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        if (navigator.onLine) {
          await fetchOrdersFromAPI(); // Server → IndexedDB
          if (user?.outlet_id) {
            await fetchHoldOrders(user.outlet_id); // Server → IndexedDB
          }
        }
        await loadOrdersFromDB();      // IndexedDB → Zustand
        await loadHoldOrdersFromDB();  // Load hold invoices as well
      } catch (err) {
        console.error("Failed to load invoices on mount:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadOrdersFromDB, loadHoldOrdersFromDB]);

  // useEffect(() => {
  //   if (orders.length && !selectedOrderId) {
  //     setSelectedOrderId(orders[0].localId);
  //   }
  // }, [orders]);
  // const uiOrders = orders.map(order => ({
  //   id: order.localId,
  //   orderId: order.serverOrderId || order.localId,
  //   customerId: order.customerId,
  //   tableId: order.tableId,
  //   amount: order.totals?.total || 0,
  //   subtotal: order.totals?.subtotal || 0,
  //   paymentMethod: order.paymentMethods?.[0]?.method || "N/A",
  //   orderItems: order.cartData || [],
  //   status: order.isSynced ? "SYNCED" : "OFFLINE",
  //   createdAt: order.createdAt,
  // }));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedHoldOrder, setSelectedHoldOrder] = useState(null);

  // 1. First, create a sorted version of the hold orders at the top of your component
  const sortedHoldOrders = [...holdOrders].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // 2. Update the useEffect that handles default selection
  useEffect(() => {
    if (!sortedHoldOrders.length) {
      setSelectedHoldOrder(null);
    } else if (
      !selectedHoldOrder ||
      !sortedHoldOrders.find(o => o.localId === selectedHoldOrder.localId)
    ) {
      // Select the first item of the SORTED array (the newest one)
      setSelectedHoldOrder(sortedHoldOrders[0]);
    }
  }, [sortedHoldOrders]);


  const orderKey = (o) => o?.localId || o?.orderId || o?.serverOrderId;
  // const selectedOrderData = selectedOrder ? orders.find(o => orderKey(o) === orderKey(selectedOrder)) || null : null;
  const selectedOrderData = selectedOrder
    ? (activeBtn === "creditInvoiceBTN" ? creditOrders : orders).find(o => orderKey(o) === orderKey(selectedOrder))
    : null;

  const isHoldInvoice = activeBtn === "holdInvoiceBTN";

  const getBtnClass = (btnKey) =>
    `text-lg py-2 px-6 border rounded-md mr-2 cursor-pointer transition-all duration-200
   ${activeBtn === btnKey
      ? "bg-gradient-to-b from-secondary to-primary text-white"
      : "text-secondary hover:bg-gradient-to-b hover:from-secondary hover:to-primary hover:text-white"
    }`;

  const [searchTerm, setSearchTerm] = useState("");
  const [holdSearchTerm, setHoldSearchTerm] = useState("");

  const currentOrders =
    activeBtn === "holdInvoiceBTN" ? sortedHoldOrders :
      activeBtn === "creditInvoiceBTN" ? creditOrders :
        orders;


  const filteredOrders = currentOrders.filter((order) => {
    if (!order) return false;

    // --- 1. DATE FILTERING LOGIC ---
    const orderDate = new Date(order.createdAt || order.orderDate);
    const now = new Date();

    if (activeBtn === "invoiceBTN") {
      const targetDate = givenDate ? new Date(givenDate) : new Date();
      const startOfDay = new Date(targetDate).setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate).setHours(23, 59, 59, 999);

      if (orderDate < startOfDay || orderDate > endOfDay) return false;

    } else if (activeBtn === "weekInvoiceBTN") {
      let start, end;

      if (dateRange?.start && dateRange?.end) {
        // Scenario: Range selected (Includes same-day range)
        start = new Date(dateRange.start).setHours(0, 0, 0, 0);
        end = new Date(dateRange.end).setHours(23, 59, 59, 999);
      }
      else if (dateRange?.start) {
        // Scenario: Only 'From' date exists - show data for that specific day only
        start = new Date(dateRange.start).setHours(0, 0, 0, 0);
        end = new Date(dateRange.start).setHours(23, 59, 59, 999);
      }
      else {
        // Default: Last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(now.getDate() - 14);
        start = fourteenDaysAgo.setHours(0, 0, 0, 0);
        end = now.setHours(23, 59, 59, 999);
      }

      if (orderDate < start || orderDate > end) return false;
    }

    // --- 2. SEARCH FILTERING LOGIC ---
    const search = searchTerm.trim().toLowerCase();
    const holdSearch = holdSearchTerm.trim().toLowerCase();

    if (isHoldInvoice) {
      const firstName = order?.cartData?.customer?.firstName;
      const phoneNumber = order?.cartData?.customer?.phoneNumber;
      const note = order?.note;

      if (holdSearch === "") return true;

      return (
        (firstName && String(firstName).toLowerCase().includes(holdSearch)) ||
        (phoneNumber && String(phoneNumber).includes(holdSearch)) ||
        (note && String(note).toLowerCase().includes(holdSearch))
      );
    } else {
      if (search === "") return true;
      const customerName = order?.customerName;
      const customerPhone = order?.customerPhone;
      const userId = order?.userId;
      const displayId = order?.display_id || order.displayId;

      return (
        (customerName && String(customerName).toLowerCase().includes(search)) ||
        (customerPhone && String(customerPhone).includes(search)) ||
        (userId && String(userId).toLowerCase().includes(search)) ||
        (displayId && String(displayId).toLowerCase().includes(search))
      );
    }
  });
  // const handleRefundAction = (refundData, refundValue, totalRefundSubtotal) => {
  //   setOrders(prevOrders => prevOrders.map(order => {
  //     if (order.orderId === refundData.orderId) {
  //       return {
  //         ...order,
  //         // Update the amount field
  //         totalAmountRefunded: (Number(order.totalAmountRefunded) || 0) + refundValue,
  //         // Add the history field
  //         refundHistory: [...(order.refundHistory || []), refundData],
  //         subtotal: (Number(order.subtotal) || 0) - totalRefundSubtotal
  //       };
  //     }
  //     return order;
  //   }));
  // };

  const handleRefundAction = async (
    refundData,
    refundValue,
    totalRefundSubtotal
  ) => {
    if (!refundData?.order_id) {
      throw new Error("Missing order_id for refund");
    }
    setIsLoading(true);
    try {
      // 1️⃣ Call backend refund API
      await refundOrderAPI(refundData);

      // 2️⃣ Sync fresh data from server
      await fetchOrdersFromAPI();

      // 3️⃣ Reload orders from IndexedDB → Zustand
      await loadOrdersFromDB();
    } catch (error) {
      // 🔴 Let RefundPopup handle error message
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const handleExchangeAction = async (newExchangeData) => {
    if (!newExchangeData?.order_id) {
      throw new Error("Missing order_id for exchange");
    }
    setIsLoading(true);
    try {
      // 1️⃣ Call backend exchange API
      await exchangeOrderAPI(newExchangeData);

      // 2️⃣ Sync fresh data from server
      await fetchOrdersFromAPI();

      // 3️⃣ Reload orders from IndexedDB → Zustand
      await loadOrdersFromDB();
    } catch (error) {
      // 🔴 Let RefundPopup handle error message
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full h-screen">
      <LoadingBar isLoading={isLoading} />
      <div className=" bg-background flex-grow flex flex-col min-h-0">
        <div className="bg-white invoice-list-header shadow-[0_0_3px_#00000028] p-2 mb-0.5">
          <div>
            <button
              className={getBtnClass("invoiceBTN")}
              onClick={() => setActiveBtn("invoiceBTN")}
            >
              Todays Invoices
            </button>

            <button
              className={getBtnClass("weekInvoiceBTN")}
              onClick={() => setActiveBtn("weekInvoiceBTN")}
            >
              2-Week Invoices
            </button>
            <button
              className={getBtnClass("holdInvoiceBTN")}
              onClick={() => setActiveBtn("holdInvoiceBTN")}
            >
              Invoices on Hold
            </button>
            <button
              className={getBtnClass("creditInvoiceBTN")}
              onClick={() => setActiveBtn("creditInvoiceBTN")}
            >
              Invoices on Credit
            </button>
          </div>
        </div>
        {activeBtn === "holdInvoiceBTN" ? (
          <HoldInvoiceList
            searchTerm={holdSearchTerm}
            setSearchTerm={setHoldSearchTerm}
            orders={filteredOrders}
            selectedHoldOrder={selectedHoldOrder}
            setSelectedHoldOrder={setSelectedHoldOrder}
          />
        ) : (
          <InvoiceList
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            orders={filteredOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            dateRange={dateRange}
            givenDate={givenDate}
            setDateRange={setDateRange}
            setGivenDate={setGivenDate}
            activeBtn={activeBtn}
          />
        )}
      </div>

      <div className="invoice-form w-[35vw] h-full overflow-y-auto">
        {!isHoldInvoice ? <InvoiceForm
          selectedOrder={selectedOrderData}
          onRefund={handleRefundAction}
          onExchange={handleExchangeAction}
          activeBtn={activeBtn}
        /> : <HoldInvoiceFrom
          selectedHoldOrder={selectedHoldOrder}
          onAddToCart={(cartData) => {
            setCartFromHold(cartData);
          }}
          onDelete={() => { setSelectedHoldOrder(); }}
        />}

      </div>
    </div>
  )
};

export default Invoices;
