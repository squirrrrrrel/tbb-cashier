import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { usePaymentMethodStore } from "../../../store/usePaymentMethodStore";

const PrintOrder = ({ show, setShow, finalOrderData, isHold = false }) => {

    const user = useAuthStore((u) => u.user);
    const { paymentMethods } = usePaymentMethodStore();
    const printRef = useRef();
    const isPrinting = useRef(false);
    const originalTitle = document.title;

    const whole = (num) => {
        return Math.floor(num);
    }

    const handlePrint = () => {
        if (printRef?.current && finalOrderData && !isPrinting.current) {
            isPrinting.current = true;

            const filename = `Invoice_${finalOrderData.display_id || finalOrderData.displayId || Date.now()}`;
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
                                font-size: 18px;
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

            try {
                document.title = filename;
            } catch { }

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                try {
                    document.title = originalTitle;
                } catch { }
                isPrinting.current = false;
                setShow(false);
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
        const { discount, subtotal, taxAmound, tax_amount, taxAmount, discount_amount, discountAmount } = finalOrderData || {};

        // Handle case where discount is an object {type, value}
        if (discount && typeof discount === 'object' && discount.type) {
            if (discount.type === "PERCENT") {
                const baseAmount = (parseFloat(subtotal) || 0) + (parseFloat(tax_amount || taxAmount || taxAmound) || 0);
                return baseAmount * (discount.value / 100);
            }
            return discount.value || 0;
        }

        // Handle cases where discount is just a number/field
        return discount_amount || discountAmount || (typeof discount === 'number' ? discount : 0);
    };

    const discountValue = getDiscountValue();

    const totalTendered = finalOrderData?.tendered_amount || finalOrderData?.tenderedAmount ||
        finalOrderData?.transactions?.reduce((sum, tx) => sum + (tx.tendered_amount || 0), 0) ||
        finalOrderData?.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) ||
        finalOrderData?.payment?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const methodLookup = Object.fromEntries(
        paymentMethods.map(m => [m.id, m.display_name])
    );

    const paymentMethodsString = [
        ...new Set(
            (finalOrderData?.payments || finalOrderData?.payment || [])
                .map(p => p.paymentMethodName || methodLookup[p.payment_method_id || p.paymentMethodId])
                .filter(Boolean)
        )
    ].join(', ') || "Cash";

    const formatOrderDate = (dateSource) => {
        if (!dateSource) return "";
        // Handle timestamps (Structure 2) vs strings
        const date = new Date(dateSource);
        if (isNaN(date.getTime())) return dateSource;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        const time = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        return `${day}-${month}-${year} ${time}`;
    };

    const formatQty = (data) => {
        const isShot = data.shots ? true : false;
        if (isShot) return data.shots

        const category = data?.category_name || data?.categoryName || "";
        const isButchery = category.toLowerCase() === "butchery" ? true : data.unit === "gm" ? true : data.unit === "kg" ? true : false;
        if (isButchery) return `${data.quantity} kg`;

        return `${data.quantity} pcs`;
    }

    const orderItems = finalOrderData.orderItems || finalOrderData.order_items || [];

    return (
        <div ref={printRef} style={{ display: "none" }}>
            <div className="receipt-content">
                <h3>{isHold ? "Hold Order Receipt" : "Sales Receipt"}</h3>

                <p><b>Order:</b> #{finalOrderData?.displayId || finalOrderData?.display_id}</p>
                <p><b>Date:</b> {formatOrderDate(finalOrderData?.order_date || finalOrderData?.created_at || finalOrderData?.createdAt || date.now())}</p>
                <p><b>Cashier:</b> {finalOrderData?.user?.first_name || user?.first_name || "-"}</p>
                <p><b>Customer:</b> {finalOrderData?.customer?.firstName || finalOrderData?.customer?.first_name || "Walk-in"} {finalOrderData?.customer?.lastName || finalOrderData?.customer?.last_name || ""}</p>
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
                        {orderItems?.map((item, index) => {
                            const productName = item.name || item.product_name || item.productName || item.product?.product_name || "unknown item";
                            const unitPrice = parseFloat(item.unitPrice || item.unit_price || item.price || 0);
                            const totalPrice = parseFloat(item.totalPrice || item.total || (unitPrice * item.quantity - (item.discount || 0)) || 0);

                            return (
                                <tr key={index}>
                                    <td>{item.shots ? `${productName} (${whole(item.quantity)}ml each)` : productName}</td>
                                    <td className="text-right">P{unitPrice.toFixed(2)}</td>
                                    <td className="text-right">{formatQty(item)}</td>
                                    <td className="text-right">P{totalPrice.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <span>
                    <b>
                        {orderItems?.length}{" "}
                        {orderItems?.length > 1
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
                            <td className="inputvalue">P{parseFloat(finalOrderData?.tax_amount || finalOrderData?.taxAmount || finalOrderData?.tax || 0).toFixed(2)}</td>
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
                            <td className="inputvalue">P{parseFloat(finalOrderData?.totalAmountToPay || finalOrderData?.total_amount || finalOrderData?.totalAmount || finalOrderData?.amount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tendered</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(totalTendered).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Change</td>
                            <td></td>
                            <td></td>
                            <td className="inputvalue">P{parseFloat(finalOrderData?.cashReturned || finalOrderData?.change_amount || finalOrderData?.transactions?.[0]?.cash_returned || 0).toFixed(2)}</td>
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