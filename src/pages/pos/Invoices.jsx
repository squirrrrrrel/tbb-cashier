import React, { useState, useEffect } from "react";
import InvoiceList from "../../components/pos/invoice/InvoiceList";
import InvoiceForm from "../../components/pos/invoice/InvoiceForm";
import HoldInvoiceList from "../../components/pos/invoice/HoldInvoiceList";
import HoldInvoiceFrom from "../../components/pos/invoice/HoldInvoiceForm";
import { useOrderStore } from "../../store/useOrderStore";
import { fetchOrdersFromAPI } from "../../utils/fetchOrdersFromAPI";
import { refundOrderAPI } from "../../api/refundApi";
import { exchangeOrderAPI } from "../../api/exchangeApi";
const Invoices = () => {
  const [activeBtn, setActiveBtn] = useState("invoiceBTN");


  

  const holdOrders = [
    {
      orderId: "HOLD-1001",
      timestamp: Date.now(),
      note: "Neha",
      cartData: {
        customer: {
          customerId: "CUST-001",
          firstName: "Rahul",
          lastName: "Verma",
          phoneNumber: "9876543210",
        },
        productsAdded: [
          {
            orderId: 1,
            product_id: "PROD-001",
            product_name: "Milk",
            categoryName: "Dairy",
            quantity: "2",
            selling_price: "50",
            price: "50",
            stockQuantity: 100,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 5,
            discount: 0,
          },
          {
            orderId: 2,
            product_id: "PROD-002",
            product_name: "Bread",
            categoryName: "Bakery",
            quantity: "1",
            selling_price: "40",
            price: "40",
            stockQuantity: 50,
            addTaxesToSalesPrice: false,
            addedTaxPercentageToSalesPrice: null,
            discount: 5,
          },
        ],
        orderItems: [
          {
            orderId: 1,
            product_id: "PROD-001",
            product_name: "Milk",
            categoryName: "Dairy",
            quantity: "2",
            selling_price: "50",
            price: "50",
            stockQuantity: 100,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 5,
            discount: 0,
            subtotal: 100,
            taxAmount: 5,
          },
          {
            orderId: 2,
            product_id: "PROD-002",
            product_name: "Bread",
            categoryName: "Bakery",
            quantity: "1",
            selling_price: "40",
            price: "40",
            stockQuantity: 50,
            addTaxesToSalesPrice: false,
            addedTaxPercentageToSalesPrice: null,
            discount: 5,
            subtotal: 35,
            taxAmount: 0,
          },
        ],
        subtotal: 135,
        taxAmount: 5,
        discount: {
          type: "FIXED",
          value: 10,
        },
        totalDiscount: 15,
        totalAmountToPay: 125,
        table: {
          tableId: 3,
          tableName: "Table 3",
        },
        serverName: "Amit Sharma",
        __isResumedHoldOrder: false,
        __resumedFromHoldId: null,
      },
    },

    {
      orderId: "HOLD-1002",
      timestamp: Date.now() - 1000 * 60 * 20,
      note: "Nimmi",
      cartData: {
        customer: null,
        productsAdded: [
          {
            orderId: 1,
            product_id: "PROD-003",
            product_name: "Eggs",
            categoryName: "Poultry",
            quantity: "12",
            selling_price: "6",
            price: "6",
            stockQuantity: 200,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 2,
            discount: 0,
          },
        ],
        orderItems: [
          {
            orderId: 1,
            product_id: "PROD-003",
            product_name: "Eggs",
            categoryName: "Poultry",
            quantity: "12",
            selling_price: "6",
            price: "6",
            stockQuantity: 200,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 2,
            discount: 0,
            subtotal: 72,
            taxAmount: 1.44,
          },
        ],
        subtotal: 72,
        taxAmount: 1.44,
        discount: {
          type: "PERCENTAGE",
          value: 0,
        },
        totalDiscount: 0,
        totalAmountToPay: 73.44,
        serverName: "Neha Singh",
        __isResumedHoldOrder: false,
        __resumedFromHoldId: null,
      },
    },

    {
      orderId: "HOLD-1003",
      timestamp: Date.now() - 1000 * 60 * 45,
      note: "Bholu",
      cartData: {
        customer: {
          customerId: "CUST-002",
          firstName: "Anjali",
          lastName: "Mehta",
          phoneNumber: "9988776655",
        },
        productsAdded: [
          {
            orderId: 1,
            product_id: "PROD-004",
            product_name: "Rice 5kg",
            categoryName: "Grains",
            quantity: "1",
            selling_price: "350",
            price: "350",
            stockQuantity: 40,
            addTaxesToSalesPrice: false,
            addedTaxPercentageToSalesPrice: null,
            discount: 20,
          },
          {
            orderId: 2,
            product_id: "PROD-005",
            product_name: "Cooking Oil",
            categoryName: "Grocery",
            quantity: "1",
            selling_price: "180",
            price: "180",
            stockQuantity: 60,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 5,
            discount: 0,
          },
        ],
        orderItems: [
          {
            orderId: 1,
            product_id: "PROD-004",
            product_name: "Rice 5kg",
            categoryName: "Grains",
            quantity: "1",
            selling_price: "350",
            price: "350",
            stockQuantity: 40,
            addTaxesToSalesPrice: false,
            addedTaxPercentageToSalesPrice: null,
            discount: 20,
            subtotal: 330,
            taxAmount: 0,
          },
          {
            orderId: 2,
            product_id: "PROD-005",
            product_name: "Cooking Oil",
            categoryName: "Grocery",
            quantity: "1",
            selling_price: "180",
            price: "180",
            stockQuantity: 60,
            addTaxesToSalesPrice: true,
            addedTaxPercentageToSalesPrice: 5,
            discount: 0,
            subtotal: 180,
            taxAmount: 9,
          },
        ],
        subtotal: 510,
        taxAmount: 9,
        discount: {
          type: "FIXED",
          value: 20,
        },
        totalDiscount: 20,
        totalAmountToPay: 499,
        table: {
          tableId: 1,
          tableName: "Table 1",
        },
        serverName: "Suresh Kumar",
        __isResumedHoldOrder: false,
        __resumedFromHoldId: null,
      },
    },
  ];

 const orders = useOrderStore(state => state.orders);
  const loadOrdersFromDB = useOrderStore(state => state.loadOrdersFromDB);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
console.log("Orders in Invoices page:", orders);
  useEffect(() => {
    loadOrdersFromDB(); // IndexedDB → Zustand
  }, []);

   useEffect(() => {
    if (orders.length && !selectedOrderId) {
      setSelectedOrderId(orders[0].localId);
    }
  }, [orders]);
  console.log("Orders in Invoices page:", orders);
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
  const [selectedHoldOrder, setSelectedHoldOrder] = useState(holdOrders[0]);

  const selectedOrderData = orders.find(o => o?.localId === selectedOrder?.localId) || orders.find(o => o) || null;


  const isHoldInvoice = activeBtn !== "invoiceBTN";

  const getBtnClass = (btnKey) =>
    `text-lg py-2 px-6 border rounded-md mr-2 cursor-pointer transition-all duration-200
   ${activeBtn === btnKey
      ? "bg-gradient-to-b from-secondary to-primary text-white"
      : "text-secondary hover:bg-gradient-to-b hover:from-secondary hover:to-primary hover:text-white"
    }`;

  const [searchTerm, setSearchTerm] = useState("");
  const [holdSearchTerm, setHoldSearchTerm] = useState("");

  const currentOrders = activeBtn === "invoiceBTN" ? orders : holdOrders;

  const filteredOrders = currentOrders.filter((order) => {
    if (!order) return false;
    const search = searchTerm.trim().toLowerCase();
    const holdSearch = holdSearchTerm.trim().toLowerCase();
    if (isHoldInvoice) {
      const firstName = order?.cartData?.customer?.firstName;
      const phoneNumber = order?.cartData?.customer?.phoneNumber;
      const note = order?.note;

      return (
        (firstName && String(firstName).toLowerCase().includes(holdSearch)) ||
        (phoneNumber && String(phoneNumber).includes(holdSearch)) ||
        (note && String(note).toLowerCase().includes(holdSearch))
      );
    } else {
      const customerId = order?.customerName;
      const customerPhone = order?.customerPhone;
      const userId = order?.userId;

      return (
        (customerId && String(customerId).toLowerCase().includes(search)) ||
        (customerPhone && String(customerPhone).includes(search)) ||
        (userId && String(userId).toLowerCase().includes(search))
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
  }
}

  const handleExchangeAction = async(newExchangeData) => {
  if (!newExchangeData?.order_id) {
    throw new Error("Missing order_id for exchange");
  }
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
  }
}

  return (
    <div className="flex w-full h-screen">
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
              className={getBtnClass("holdInvoiceBTN")}
              onClick={() => setActiveBtn("holdInvoiceBTN")}
            >
              Invoices on Hold
            </button>
          </div>
        </div>
        {activeBtn === "invoiceBTN" ? (
          <InvoiceList
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            orders={filteredOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        ) : (
          <HoldInvoiceList
            searchTerm={holdSearchTerm}
            setSearchTerm={setHoldSearchTerm}
            orders={filteredOrders}
            selectedHoldOrder={selectedHoldOrder}
            setSelectedHoldOrder={setSelectedHoldOrder}
          />
        )}
      </div>

      <div className="invoice-form w-2/5 h-full overflow-y-auto">
        {!isHoldInvoice ? <InvoiceForm
          selectedOrder={selectedOrderData}
          onRefund={handleRefundAction}
          onExchange={handleExchangeAction}
        /> : <HoldInvoiceFrom
          selectedHoldOrder={selectedHoldOrder}
        />}

      </div>
    </div>
  )
};

export default Invoices;
