import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { usePaymentMethodStore } from "../../../store/usePaymentMethodStore";
// import { getProductByServerIdDB } from "../../../db/productsDB";
const PrintOrder = ({ show, setShow, finalOrderData, isHold=false }) => {
    const user = useAuthStore((u) => u.user);
    const { paymentMethods } = usePaymentMethodStore();
    const printRef = useRef();
    const isPrinting = useRef(false) // Flag to prevent double printing
    const [productsMap, setProductsMap] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const originalTitle = document.title;
    const whole = (num) => {
        return Math.floor(num);
    }
    // console.log(finalOrderData.discount.value, finalOrderData?.orderDiscountAmount);
    
    //  useEffect(() => {
    //     if (!show || !finalOrderData?.orderItems?.length) return;

    //     let cancelled = false;

    //     const loadProducts = async () => {
    //       setLoading(true);

    //       const map = {};

    //       for (const item of finalOrderData.orderItems) {
    //         const productId = item.product_id;
    //         if (!productId || map[productId]) continue;

    //         const product = await getProductByServerIdDB(productId);
    //         if (product) {
    //           map[productId] = product;
    //         }
    //       }
    //       console.log("products",productId)

    //       if (!cancelled) {
    //         setProductsMap(map);
    //         setLoading(false);
    //       }
    //     };

    //     loadProducts();

    //     return () => {
    //       cancelled = true;
    //     };
    //   }, [show, finalOrderData]);

    const handlePrint = () => {
        // Only run if not already printing and ref exists
        if (printRef?.current && finalOrderData && !isPrinting.current) {
            isPrinting.current = true;

            const filename = `Invoice_${finalOrderData.display_id || Date.now()}`;
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";

            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            document.body.appendChild(iframe);
            iframe.contentDocument.write(`
                <html>
                    <head>
                        <title>${filename}</title>
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
                            .sub-total-table tr:nth-child(3) td, 
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
                            .bold {
                                    font-weight: 700;
                                    font-size: 24px
                            }
                        </style>
                    </head>
                    <body>
                        ${printRef.current.innerHTML}
                    </body>
                </html>
            `);

            iframe.contentDocument.close();

            // iframe.contentWindow.onafterprint = () => {
            //     document.body.removeChild(iframe);
            //     try {
            //         document.title = originalTitle;
            //     } catch { }
            // };

            // Try to influence the filename used by "Save as PDF"
            try {
                // iframe.contentDocument.title = filename;
                document.title = filename;
            } catch { }

            // Small delay to ensure styles/content are loaded in the iframe
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                try {
                    document.title = originalTitle;
                } catch { }
                isPrinting.current = false; // Reset flag
                setShow(false); // Close state in parent
            }, 500);
        }
    };

    useEffect(() => {
        if (show === true && finalOrderData) {
            handlePrint();
            setShow(false);
        }
    }, [show, finalOrderData]);

    const getDiscountValue = () => {
  const { discount, subtotal, taxAmound, discount_amount, discountAmount } = finalOrderData || {};
  
  // 1. Handle "No Discount" early
  if (!discount?.type) return discount_amount || discountAmount || 0;

  // 2. Calculate based on type
  if (discount.type === "PERCENT") {
    const baseAmount = (subtotal || 0) + (taxAmound || 0);
    return baseAmount * (discount.value / 100);
  }

  // 3. Flat value (Note: Verify if you meant discount.value instead of finalOrderData.value)
  return discount.value || 0;
};

const discountValue = getDiscountValue();

const totalTendered = finalOrderData?.transactions?.reduce((sum, tx) => {
  return sum + (tx.tendered_amount || 0);
}, 0) || 0;

const methodLookup = Object.fromEntries(
  paymentMethods.map(m => [m.id, m.display_name])
);

const paymentMethodsString = [
  ...new Set(
    finalOrderData?.payments
      ?.map(p => methodLookup[p.payment_method_id || p.paymentMethodId]) // Look up the name by ID
      .filter(Boolean) // Remove any undefined results (if an ID isn't found)
  )
].join(', ');

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
        <div ref={printRef} style={{ display: "none" }}>
            <div className="receipt-content">
                <h3>{isHold ? "Hold Order Receipt" : "Sales Receipt"}</h3>

                {/* Fixed typo: oderId -> orderId */}
                <p><b>Order:</b> #{finalOrderData?.orderId || finalOrderData?.display_id}</p>
                <p><b>Date:</b> {formatOrderDate(finalOrderData?.order_date || finalOrderData?.created_at || new Date())}</p>
                <p><b>Cashier:</b> {finalOrderData?.user?.first_name || user?.first_name || "-"}</p>
                <p><b>Customer:</b> {finalOrderData?.customer?.firstName || finalOrderData?.customer?.first_name} {finalOrderData?.customer?.lastName || finalOrderData?.customer?.last_name}</p>
                <p><b>Payment:</b> {paymentMethodsString}</p>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalOrderData?.orderItems?.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name || item.productName || item.product?.product_name}</td>
                                <td className="text-right">P{item.price || item.unit_price}</td>
                                <td className="text-right">{item.shots ? `${item.shots}-${whole(item.quantity/item.shots)}` : whole(item.quantity)}</td>
                                <td className="text-right">P{parseFloat(item.totalPrice || (item.price * item.quantity) || item.total_amount || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                <span>
                    <b>
                        {finalOrderData?.orderItems?.length}{" "}
                        {finalOrderData?.orderItems?.length > 1
                            ? "ITEMS SOLD"
                            : "ITEM SOLD"}
                    </b>
                </span>

                <table className="sub-total-table">
                    <tbody>
                        <tr style={{ borderTop: "2px dashed #555" }}>
                            <td>Subtotal</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(finalOrderData?.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(finalOrderData?.tax_amount || finalOrderData?.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Discount</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(discountValue).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(finalOrderData?.totalAmountToPay || finalOrderData?.total_amount || finalOrderData?.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tendered</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(totalTendered || finalOrderData?.tenderedAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Change</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat( finalOrderData?.cashReturned || finalOrderData?.transactions?.[0]?.cash_returned || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div>
                    <span>Thank You, HAVE A NICE DAY!</span>
                </div>
            </div>
        </div>
    );
};

export default PrintOrder;