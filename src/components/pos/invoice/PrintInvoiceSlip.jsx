import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";

const PrintInvoiceSlip = ({ show, setShow = false, orderDetails, productList }) => {
  const printRef = useRef();
  const user = useAuthStore((u) => u.user);
  const [ReceiveAmount, setReceiveAmount] = useState(0.0);
  const [RefundAmound, setRefundAmount] = useState(0.0);

  const handlePrint = () => {
    if (printRef?.current) {
      const formatDateForFilename = (dt) => {
        try {
          // e.g., "Nov 5,2025"
          return dt
            .toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            .replace(", ", ", ");
        } catch {
          return "";
        }
      };
      const printDate = orderDetails?.orderDate
        ? new Date(orderDetails.orderDate)
        : new Date();
      const datePart = formatDateForFilename(printDate);
      const filename = `${datePart ? `${datePart}` : ""} ( Invoice #${orderDetails?.orderId ?? "Receipt"
        } )`;
      const originalTitle = document.title;

      // Avoid any external network requests during print on slow networks.
      // If a preloaded data URL is available on window, use it; otherwise skip the logo entirely.
      const logoDataUrl =
        typeof window !== "undefined" ? window.__PRINT_LOGO_DATAURL : null;
      const logoFigureHtml = logoDataUrl
        ? `<figure class="logo"><img src="${logoDataUrl}" alt="logo" /></figure>`
        : "";

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      iframe.contentDocument.write(`
                <html>
                    <head>
                        <title>${filename}</title>
                        ${logoFigureHtml}
                        <style>
                            @media print {
                                @page {
                                    margin: 0;
                                    size: 80mm 297mm;
                                }
                            }
                            body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                margin: 0;
                                width: 80mm;
                            }
                            h3 {
                                text-align: center;
                                text-transform: uppercase;
                                border-top: 2px dashed #555;
                                border-bottom: 2px dashed #555;
                                padding: 10px 0;
                                margin: 0 0 10px 0;
                            }
                            figure {
                                text-align: center;
                                margin: 0;
                            }
                            img {
                                width: 100px;
                                height: 100px;
                                margin: 0 auto;
                            }
                            .receipt-content {
                                font-size: 18px;
                                width: 100%;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 10px 0;
                            }
                            table th, table td {
                                font-size: 18px
                                font-weight: 400;
                                padding: 8px 0;
                                text-align: left;
                            }
                            .inputvalue{
                              text-align: right;
                                }
                            table th {
                                font-weight: 700;
                                border-top: 2px dashed #555;
                                border-bottom: 2px dashed #555;
                            }
                            table td:first-child {
                                width: 39%;
                            }
                            .sub-total-table tr:nth-child(4) td {
                                font-weight: 700;
                                font-size: 20px
                            }
                            .sub-total-table tr:nth-child(1) td {
                                font-weight: 700;
                                font-size: 18px
                            }
                            .table tr:nth-child(5) td,
                            .sub-total-table tr:nth-child(1) td,
                            .sub-total-table tr:nth-child(2) td,
                            .sub-total-table tr:nth-child(4) td, 
                            .sub-total-table tr:last-child td {
                                border-bottom: 2px dashed #555;
                                padding-bottom: 5px;
                            }
                            .receipt-content div {
                                margin-top: 20px;
                                line-height: 1.4;
                                text-align: center;
                            }
                            span {
                                display: block;
                                text-align: center;
                                margin: 2px 0;
                            }
                            .receipt-content span b {
                                padding: 20px 0 3px;
                                display: inline-block;
                            }
                            p {
                                margin: 5px 0;
                            }
                        </style>
                    </head>
                    <body>
                        ${printRef?.current?.innerHTML}
                    </body>
                </html>
            `);

      iframe.contentDocument.close();

      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
        try {
          document.title = originalTitle;
        } catch { }
      };

      // Try to influence the filename used by "Save as PDF"
      try {
        iframe.contentDocument.title = filename;
        document.title = filename;
      } catch { }

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 50);
    }
  };
  useEffect(() => {
    if (!orderDetails?.orderItems?.length) {
      setRefundAmount(0);
      setReceiveAmount(0);
      return;
    }

    const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

    const { returnTotal, newTotal } = orderDetails.orderItems.reduce(
      (totals, item) => {
        const subtotal = safeNum(item?.subtotal);
        const baseAmount = Math.abs(subtotal);
        const taxPercentage = safeNum(
          item?.taxPercentagePerProduct ?? item?.tax_percentage_per_product ?? 0
        );
        const taxAmount = (baseAmount * taxPercentage) / 100;
        const grandTotal = baseAmount + taxAmount;

        if (item?.type === "RETURN") {
          totals.returnTotal += grandTotal;
        } else if (
          item?.type === "EXCHANGE_NEW" ||
          item?.type === "REEXCHANGE_NEW"
        ) {
          totals.newTotal += grandTotal;
        }

        return totals;
      },
      { returnTotal: 0, newTotal: 0 }
    );

    const difference = newTotal - returnTotal;

    if (difference > 0) {
      setRefundAmount(0);
      setReceiveAmount(difference);
    } else if (difference < 0) {
      setRefundAmount(Math.abs(difference));
      setReceiveAmount(0);
    } else {
      setRefundAmount(0);
      setReceiveAmount(0);
    }
  }, [orderDetails]);
  useEffect(() => {
    if (show === true && orderDetails) {
      handlePrint();
      setShow(false);
    }
  }, [show, orderDetails]);

  const formatOrderDate = (dateSource) => {
    if (!dateSource) return "";

    const date = new Date(dateSource);

    if (isNaN(date.getTime())) return dateSource;

    const day = date.getDate().toString().padStart(2, '0');
    // Use '2-digit' for numeric month (01, 02, etc.)
    const month = date.toLocaleString('en-GB', { month: '2-digit' });
    const year = date.getFullYear();

    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    return `${day}-${month}-${year} ${time}`;
  };

  return (
    <>
      <div ref={printRef} style={{ display: "none" }}>
        <div className="receipt-content">
          <h3>Sales Receipt</h3>
          <p>
            <b>Order:</b> #{orderDetails?.display_id || "ofline Order"}
          </p>
          <p>
            <b>Date:</b> {formatOrderDate(orderDetails?.orderDate || orderDetails?.createdAt || new Date())}
          </p>
          <p>
            <b>Cashier:</b> {orderDetails?.cashierName ?? user?.first_name ?? "-"}
          </p>
          <p>
            <b>Customer:</b> {orderDetails?.customerName ?? "-"}
          </p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th className="inputvalue">Qty</th>
                <th className="inputvalue">Total</th>
              </tr>
            </thead>
            {/* <tbody>
              {orderDetails?.orderItems?.map((product, index) => (
                <tr key={index}>
                  <td>
                    {product?.productName}
                    {product?.type === "EXCHANGE_NEW"
                      ? "(New item)"
                      : product?.type === "RETURN"
                      ? "(Return)"
                      : ""}
                  </td>
                  <td>{`P ${product?.subtotal}`}</td>
                  <td>{product?.quantity}</td>
                  <td>{`P${product?.subtotal}`}</td>
                </tr>
              ))}
            </tbody> */}
            <tbody>
              {(() => {
                const originalItems = orderDetails?.orderItems || [];
                const exchangeGroups = orderDetails?.orderItems?.filter(item => item.type === "EXCHANGE_NEW" || item.type === "RETURN") || [];

                return (
                  <>
                    {/* 1. ORIGINAL ITEMS SECTION */}
                    {originalItems.length > 0 && (
                      <>
                        <tr>
                          <td colSpan="4" style={{ fontWeight: "bold", borderTop: "2px dashed #555", paddingTop: "8px" }}>
                            ORIGINAL ITEMS
                          </td>
                        </tr>
                        {originalItems.filter(item => item.type === null).map((item, idx) => (
                          <tr key={`orig-${idx}`}>
                            <td>{item.shots ? `${item.productName || item.name} (${item.quantity / item.shots}ml each)` : item.productName || item.name}</td>
                            <td>{`P${parseFloat(item.unitPrice || item.price).toFixed(2)}`}</td>
                            <td className="inputvalue">{item.shots ? item.shots : item.quantity}{item.category_name?.toLowerCase() === "butchery" ? " kg" : item.shots ? "" : "pcs"}</td>
                            <td className="inputvalue">{`P${parseFloat(item.subtotal || item.total).toFixed(2)}`}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* 2. EXCHANGES SECTION */}
                    {exchangeGroups.length > 0 && (
                      <>
                        <tr>
                          <td colSpan="4" style={{ fontWeight: "bold", borderTop: "2px dashed #555", paddingTop: "8px", marginTop: "10px" }}>
                            EXCHANGES
                          </td>
                        </tr>
                        {exchangeGroups.map((ri, exIdx) => (
                          <React.Fragment key={`ex-group-${exIdx}`}>
                            {/* Render Returns */}


                            {ri.type === "RETURN" && (
                              <tr key={`ret-${exIdx}`}>
                                <td>{ri.productName || "Returned Item"} (Ret)</td>
                                <td>P{ri.unitPrice}</td>
                                <td className="inputvalue">{ri.quantity}{ri.unit}</td>
                                <td className="inputvalue">-P{parseFloat(Math.abs(ri.subtotal || 0)).toFixed(2)}</td>
                              </tr>
                            )}
                            {ri.type === "EXCHANGE_NEW" && (
                              <tr key={`new-${exIdx}`}>
                                <td>{ri.productName || "Returned Item"} (New)</td>
                                <td>P{ri.unitPrice}</td>
                                <td className="inputvalue">{ri.quantity}{ri.unit}</td>
                                <td className="inputvalue">P{parseFloat(ri.subtotal).toFixed(2)}</td>
                              </tr>
                            )}

                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
          <span>
            <b>
              {orderDetails?.orderItems?.length}{" "}
              {orderDetails?.orderItems?.length > 1
                ? "Items Sold"
                : "Item Sold"}
            </b>
          </span>
          <table className="sub-total-table">
            <tbody>
              <tr>
                <td>Sub Total</td>
                <td></td>
                <td></td>
                <td className="inputvalue">{`P${parseFloat(orderDetails?.subtotal).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td></td>
                <td></td>
                <td className="inputvalue">{`P${parseFloat(orderDetails?.discountAmount).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td></td>
                <td></td>
                <td className="inputvalue">
                  {orderDetails?.taxAmount
                    ? `P${parseFloat(orderDetails?.taxAmount).toFixed(2)}`
                    : "-"}
                </td>
              </tr>
              <tr>
                <td>Total</td>
                <td></td>
                <td></td>
                <td className="inputvalue">{`P${parseFloat(orderDetails?.totalAmount).toFixed(2)}`}</td>
              </tr>
              <tr>
                <td>
                  Exchange
                  {RefundAmound ? "(refund)" : ReceiveAmount ? "(receive)" : ""}
                </td>
                <td></td>
                <td></td>
                <td className="inputvalue">
                  {RefundAmound
                    ? RefundAmound.toFixed(2)
                    : ReceiveAmount
                      ? ReceiveAmount.toFixed(2)
                      : "-"}
                </td>
              </tr>
              <tr>
                <td>Refunded</td>
                <td></td>
                <td></td>
                <td className="inputvalue">
                  {orderDetails?.refunded ? `P${parseFloat(orderDetails?.refunded).toFixed(2)}` : "-"}
                </td>
              </tr>
              {/* {selectedOrder?.payments.map((item,i) => (
            <div className="flex justify-between">
            <p className="capitalize">{item?.paymentMethod} (tendered Amount)</p>
            <span>P{selectedOrder?.isSynced ? item?.amount : selectedOrder?.tenderedAmount}</span>
          </div>
          ))} */}
              {orderDetails?.payments?.map((item, i) => (
                <tr>
                  <td>{item?.paymentMethod || `Payment (${i + 1})`}</td>
                  <td></td>
                  <td></td>
                  <td className="inputvalue">
                    P{orderDetails?.isSynced ? item?.amount.toFixed(2) : orderDetails?.tenderedAmount || item?.amount}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Change</td>
                <td></td>
                <td></td>
                <td className="inputvalue">
                  P{orderDetails?.cashReturned ? orderDetails?.cashReturned : orderDetails?.transactions?.[0]?.cashReturned
                    ? `P${orderDetails?.transactions?.[0]?.cashReturned}`
                    : "0.00"}
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            <span>THANK YOU, HAVE A NICE DAY.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintInvoiceSlip;
