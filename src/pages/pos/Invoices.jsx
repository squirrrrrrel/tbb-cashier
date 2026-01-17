import React, { useState, useEffect, use } from "react";
import InvoiceList from "../../components/pos/invoice/InvoiceList";
import InvoiceForm from "../../components/pos/invoice/InvoiceForm";
import HoldInvoiceList from "../../components/pos/invoice/HoldInvoiceList";
import HoldInvoiceFrom from "../../components/pos/invoice/HoldInvoiceForm";

const Invoices = () => {
  const [activeBtn, setActiveBtn] = useState("invoiceBTN");


  const ordersData = [
    {
      orderId: "ORD-1001",
      userId: "USR-01",
      customerId: "CUST-01",
      tableId: "T-01",
      amount: "450",
      subtotal: 420,
      discount: 20,
      totalAmountRefunded: 0,
      paymentMethodId: "CASH",
      tenderedAmount: 500,
      change: 50,
      orderItems: [
        {
          productId: 1,
          productName: "Milk",
          unitAmount: 50,
          taxPercentagePerProduct: 5,
          quantity: 4,
          itemSubtotal: 200,
        },
        {
          productId: 2,
          productName: "Bread",
          unitAmount: 40,
          quantity: 2,
          itemSubtotal: 80,
        },
        {
          productId: 3,
          productName: "Eggs",
          unitAmount: 70,
          quantity: 2,
          itemSubtotal: 140,
        },
      ],
    },

    {
      orderId: "ORD-1002",
      userId: "USR-02",
      customerId: "CUST-02",
      tableId: "T-03",
      amount: "820",
      subtotal: 800,
      discount: 0,
      totalAmountRefunded: 0,
      paymentMethodId: "UPI",
      tenderedAmount: 820,
      change: 0,
      orderItems: [
        {
          productId: 4,
          productName: "Rice 5kg",
          unitAmount: 350,
          taxPercentagePerProduct: 5,
          quantity: 2,
          itemSubtotal: 700,
        },
        {
          productId: 5,
          productName: "Cooking Oil",
          unitAmount: 120,
          quantity: 1,
          itemSubtotal: 120,
        },
      ],
    },

    {
      orderId: "ORD-1003",
      userId: "USR-03",
      customerId: "CUST-03",
      amount: "260",
      subtotal: 260,
      discount: 0,
      totalAmountRefunded: 0,
      paymentMethodId: "CARD",
      tenderedAmount: 260,
      change: 0,
      orderItems: [
        {
          productId: 6,
          productName: "Biscuits",
          unitAmount: 40,
          quantity: 4,
          itemSubtotal: 160,
        },
        {
          productId: 7,
          productName: "Juice",
          unitAmount: 50,
          quantity: 2,
          itemSubtotal: 100,
        },
      ],
    },

    {
      orderId: "ORD-1004",
      userId: "USR-01",
      customerId: "CUST-04",
      tableId: "T-05",
      amount: "1250",
      subtotal: 1250,
      discount: 50,
      totalAmountRefunded: 0,
      paymentMethodId: "CASH",
      tenderedAmount: 1300,
      change: 50,
      orderItems: [
        {
          productId: 8,
          productName: "Atta 10kg",
          unitAmount: 520,
          quantity: 1,
          itemSubtotal: 520,
        },
        {
          productId: 9,
          productName: "Ghee",
          unitAmount: 480,
          quantity: 1,
          itemSubtotal: 480,
        },
        {
          productId: 10,
          productName: "Dry Fruits Pack",
          unitAmount: 300,
          quantity: 1,
          itemSubtotal: 300,
        },
      ],
    },

    {
      orderId: "ORD-1005",
      userId: "USR-04",
      customerId: "CUST-05",
      amount: "150",
      subtotal: 150,
      discount: 0,
      totalAmountRefunded: 0,
      paymentMethodId: "UPI",
      tenderedAmount: 150,
      change: 0,
      orderItems: [
        {
          productId: 11,
          productName: "Cold Drink",
          unitAmount: 50,
          quantity: 3,
          itemSubtotal: 150,
        },
      ],
    },

    {
      orderId: "ORD-1006",
      userId: "USR-02",
      customerId: "CUST-06",
      tableId: "T-02",
      amount: "980",
      subtotal: 980,
      discount: 80,
      totalAmountRefunded: 0,
      paymentMethodId: "CARD",
      tenderedAmount: 1000,
      change: 20,
      orderItems: [
        {
          productId: 12,
          productName: "Paneer",
          unitAmount: 320,
          quantity: 2,
          itemSubtotal: 640,
        },
        {
          productId: 13,
          productName: "Butter",
          unitAmount: 170,
          quantity: 2,
          itemSubtotal: 340,
        },
      ],
    },

    {
      orderId: "ORD-1007",
      userId: "USR-05",
      customerId: "CUST-07",
      amount: "560",
      subtotal: 560,
      discount: 0,
      totalAmountRefunded: 100,
      paymentMethodId: "CASH",
      tenderedAmount: 600,
      change: 40,
      orderItems: [
        {
          productId: 14,
          productName: "Tea Powder",
          unitAmount: 280,
          quantity: 2,
          itemSubtotal: 560,
        },
      ],
    },

    {
      orderId: "ORD-1008",
      userId: "USR-06",
      customerId: "CUST-08",
      tableId: "T-06",
      amount: "330",
      subtotal: 330,
      discount: 30,
      totalAmountRefunded: 0,
      paymentMethodId: "UPI",
      tenderedAmount: 350,
      change: 20,
      orderItems: [
        {
          productId: 15,
          productName: "Chips",
          unitAmount: 30,
          quantity: 5,
          itemSubtotal: 150,
        },
        {
          productId: 16,
          productName: "Chocolate",
          unitAmount: 60,
          quantity: 3,
          itemSubtotal: 180,
        },
      ],
    },

    {
      orderId: "ORD-1009",
      userId: "USR-01",
      customerId: "CUST-09",
      amount: "199",
      subtotal: 199,
      discount: 0,
      totalAmountRefunded: 0,
      paymentMethodId: "CARD",
      tenderedAmount: 199,
      change: 0,
      orderItems: [
        {
          productId: 17,
          productName: "Ice Cream",
          unitAmount: 199,
          quantity: 1,
          itemSubtotal: 199,
        },
      ],
    },

    {
      orderId: "ORD-1010",
      userId: "USR-03",
      customerId: "CUST-10",
      tableId: "T-08",
      amount: "720",
      subtotal: 720,
      discount: 20,
      totalAmountRefunded: 0,
      paymentMethodId: "UPI",
      tenderedAmount: 750,
      change: 30,
      orderItems: [
        {
          productId: 18,
          productName: "Veg Thali",
          unitAmount: 180,
          quantity: 4,
          itemSubtotal: 720,
        },
      ],
    },
  ];

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

  const [orders, setOrders] = useState(ordersData);
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [selectedHoldOrder, setSelectedHoldOrder] = useState(holdOrders[0]);

  const selectedOrderData = orders.find(o => o.orderId === selectedOrder?.orderId) || orders[0];

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

    const search = searchTerm.trim().toLowerCase();
    const holdSearch = holdSearchTerm.trim().toLowerCase();
    if (isHoldInvoice) {
      return (
        order?.orderId?.toLowerCase().includes(holdSearch) ||
        order?.cartData?.customer?.firstName?.toLowerCase().includes(holdSearch) ||
        order?.cartData?.customer?.phoneNumber?.includes(holdSearch) ||
        order?.note?.toLowerCase().includes(holdSearch)
      )
    } else {
      return (
        order?.orderId?.toLowerCase().includes(search) ||
        order?.customerId?.toLowerCase().includes(search) ||
        order?.customerPhone?.includes(search) ||
        order?.userId?.toLowerCase().includes(search)
      )
    }
  });

  const handleRefundAction = (refundData, refundValue, totalRefundSubtotal) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.orderId === refundData.orderId) {
        return {
          ...order,
          // Update the amount field
          totalAmountRefunded: (Number(order.totalAmountRefunded) || 0) + refundValue,
          // Add the history field
          refundHistory: [...(order.refundHistory || []), refundData],
          subtotal: order.subtotal-totalRefundSubtotal
        };
      }
      return order;
    }));
  };

  const handleExchangeAction = (newExchangeData) => {
    if (newExchangeData.length === 0) return;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.orderId === selectedOrderData.orderId) {
        return {
          ...order,
          // Store in the structure you requested
          exchangeData: [...(order.exchangeData || []), newExchangeData]
        };
      }

      return order;
    }));
  };

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
