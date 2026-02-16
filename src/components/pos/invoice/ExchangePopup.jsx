import React, { useEffect, useState } from "react";
import defaultImg from "./../../../assets/images/Default_Product_Img.png";
import exchangeImg from "./../../../assets/images/exchange.png";
import { useNotification } from "../../../hooks/useNotification";

const ExchangePopup = ({ open, onClose, items = [], products = [], onExchange, orderId }) => {
    // We store a state that combines the old item with its new exchange details
    const [exchangeRows, setExchangeRows] = useState([]);
    const [restock, setRestock] = useState(true);
    const { notifyError, notifySuccess } = useNotification();


    useEffect(() => {
        if (open) {
            const exchangeableItems = items.filter(
                (item) => item.type !== "RETURN" && item.quantity - item.refundQuantity > 0 && item.category_name !== "Butchery" && item.category_name !== "Shots"
            );
            setExchangeRows(
                exchangeableItems.map((item) => ({
                    ...item,
                    selectedNewProductId: "",
                    returnQty: 0,      // <--- Added: Number of old items returned
                    newQty: 0,         // <--- Added: Number of new items taken
                    newUnitValue: 0,
                    newDiscount: 0,
                    newTax: 0,
                }))
            );
        }
    }, [open, items]);

    if (!open) return null;
    // const handleRowChange = (index, field, value) => {
    //     const updated = [...exchangeRows];

    //     if (field === "selectedNewProductId") {
    //         const prod = products.find((p) => (p.id || p.serverId).toString() === value.toString());
    //         updated[index].selectedNewProductId = value;
    //         // Store the product name/price inside the row so the parent doesn't have to look it up
    //         updated[index].newProductName = prod ? prod.product_name : "";
    //         updated[index].newUnitValue = prod ? (prod.selling_price || prod.price) : 0;

    //     } else {
    //         updated[index][field] = value;
    //     }

    //     setExchangeRows(updated);
    // };
    const handleRowChange = (index, field, value) => {
        setExchangeRows(prev => {
            const updated = [...prev];

            if (field === "selectedNewProductId") {
                const prod = products.find(
                    p => String(p.id || p.serverId) === String(value)
                );

                updated[index].selectedNewProductId = value;
                updated[index].newProductName = prod?.name || "";
                updated[index].newTax = prod?.tax || 0;
                updated[index].newUnitValue = Number(
                    prod?.sellingPrice ?? prod?.price ?? 0
                );
            } else {
                updated[index][field] = value;
            }

            return updated;
        });
    };
    const prevtotalOldValue = exchangeRows.reduce((sum, row) =>
        sum + (Number(row.quantity) * Number(row.unitPrice)) + (Number(row.quantity) * Number(row.unitPrice) * (row.taxPercentagePerProduct || 0)) / 100, 0
    );
    // Calculations
    const totalOldValue = exchangeRows.reduce((sum, row) =>
        sum + (Number(row.returnQty) * Number(row.unitPrice)) + (Number(row.returnQty) * Number(row.unitPrice) * (row.taxPercentagePerProduct || 0)) / 100, 0
    );
    const totalNewValue = exchangeRows.reduce((sum, row) => {
        const subtotal = row.newQty * row.newUnitValue; // Based on newQty
        const discountAmt = (subtotal * (row.newDiscount || 0)) / 100;
        const taxAmt = ((subtotal - discountAmt) * (row.newTax || 0)) / 100;
        return sum + (subtotal - discountAmt + taxAmt); // Add tax to the new total
    }, 0);

    const diff = totalNewValue - totalOldValue;
    const refundAmount = diff < 0 ? Math.abs(diff) : 0;
    const receiveAmount = diff > 0 ? diff : 0;


    // const handleFinalSubmit = async () => {
    //   try {
    //     // 1️⃣ Build backend-compatible items array
    //     const items = exchangeRows
    //       .filter(row => row.returnQty > 0 )
    //       .map(row => {
    //         const newItem = exchangeRows.find(
    //           r =>
    //             r.selectedNewProductId &&
    //             r.newQty > 0
    //         );

    //         const oldTotal = row.returnQty * row.unitPrice;
    //         const newTotal =
    //           (newItem?.newQty || 0) * (newItem?.newUnitValue || 0);

    //         const diff = newTotal - oldTotal;
    //         return {
    //           old_product_id: row.productId,
    //           old_product_quantity: row.returnQty,
    //           new_product_id: newItem?.selectedNewProductId,
    //           new_product_quantity: newItem?.newQty || 0,
    //           refundAmount: diff < 0 ? Math.abs(diff) : 0,
    //           receiveAmount: diff > 0 ? diff : 0,
    //           reason: "Customer Exchange",
    //         };
    //       });

    //     // 2️⃣ Final API payload
    //     const apiPayload = {
    //       order_id: orderId,
    //       items,
    //     };

    //     // 3️⃣ Call backend
    //     await onExchange(apiPayload);

    //     notifySuccess("Product exchanged successfully");
    //     onClose();
    //   } catch (error) {
    //     console.error(error);
    //     notifyError("Something went wrong while exchanging product");
    //   }
    // };
    const handleFinalSubmit = async () => {
        try {
            // 1️⃣ Build exchange items row-by-row (CORRECT)
            const exchangeItems = exchangeRows
                .filter(row => row.returnQty > 0)
                .map(row => {
                    // Calculate Old Total (Including Tax if that's your business rule)
                    const oldTax = (row.returnQty * row.unitPrice * (row.taxPercentagePerProduct || 0)) / 100;
                    const oldTotal = (row.returnQty * row.unitPrice) + oldTax;

                    // Calculate New Total (Including Tax)
                    const newSubtotal = row.newQty * row.newUnitValue;
                    const discountAmt = (newSubtotal * (row.newDiscount || 0)) / 100;
                    const newTaxAmt = ((newSubtotal - discountAmt) * (row.newTax || 0)) / 100;
                    const newTotal = (newSubtotal - discountAmt) + newTaxAmt;

                    const rowDiff = newTotal - oldTotal;

                    return {
                        old_product_id: row.productId,
                        old_product_quantity: row.returnQty,
                        new_product_id: row.selectedNewProductId,
                        new_product_quantity: row.newQty,
                        refundAmount: rowDiff < 0 ? Math.abs(rowDiff) : 0,
                        receiveAmount: rowDiff > 0 ? rowDiff : 0,
                        reason: "Customer Exchange",
                    };
                });

            // 2️⃣ FINAL FRONTEND TOTALS (IMPORTANT)
            const finalPayload = {
                order_id: orderId,
                items: exchangeItems,

                // returnAmount: totalOldValue,
                // exchangeAmount: totalNewValue,
                //refundAmount,
                //receivedAmount: receiveAmount,

                //restock,
            };

            // 3️⃣ Call parent (frontend-sorted)
            await onExchange(finalPayload, receiveAmount);

            notifySuccess("Product exchanged successfully");
            onClose();
        } catch (error) {
            console.error(error);
            notifyError("Something went wrong while exchanging product");
        }
    };


    const isExchangeDisabled = exchangeRows.length === 0 || !exchangeRows.every(row => {
        // If the user hasn't touched this row (returnQty is 0 or empty), it's technically "valid" to skip
        if (!row.returnQty || row.returnQty <= 0) {
            return true;
        }

        // If they ARE returning something, they MUST fulfill these requirements
        return (
            row.selectedNewProductId !== "" &&
            row.newQty > 0
        );
    }) || !exchangeRows.some(row => row.returnQty > 0);


    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center px-3 sm:px-6 md:px-12 lg:px-60 py-30 sm:py-10 md:py-20 lg:py-25"
            onClick={onClose}>
            <div className="bg-white w-full h-full rounded-lg shadow-lg p-5 flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl text-center text-[#555555] font-bold mb-4">Available Items for Exchange</h2>

                <div className="overflow-y-auto flex-1 pr-2">
                    {exchangeRows.map((item, index) => (
                        <div key={index} className="flex items-center py-4  gap-4 w-full min-w-0">

                            {/* LEFT SIDE: (1 + 2) - 50% Width */}
                            <div className="flex items-center gap-4 flex-[1.2] min-w-0">
                                {/* 1. PRODUCT INFO */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} className="w-12.5 object-cover rounded shadow-sm flex-shrink-0" alt="product" />
                                    ) : (
                                        <img src={defaultImg} className="w-12.5 object-cover rounded shadow-sm flex-shrink-0" alt="product" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-md text-gray-500 font-bold">{item.productName}</p>
                                        <p className="text-sm text-gray-500 ">P{item.unitPrice} x {item.quantity - item.refundQuantity} = {item.unitPrice * item.quantity}</p>
                                    </div>
                                </div>

                            </div>

                            {/* 2. QUANTITY ADJUSTER */}
                            <div className="flex items-center flex-shrink-0">
                                <button
                                    onClick={() => handleRowChange(index, "returnQty", Math.max(0, item.returnQty - 1))}
                                    className="py-1.5 px-2.5 flex items-center justify-center font-bold bg-gradient-to-b from-secondary to-primary text-white"
                                >
                                    −
                                </button>
                                <span className="px-3 py-2 text-center text-sm border-y-2  border-gray-100">{item.returnQty}</span>
                                <button
                                    onClick={() => handleRowChange(index, "returnQty", Math.min(item.quantity, item.returnQty + 1))}
                                    className="py-1.5 px-2.5 flex items-center justify-center font-bold bg-gradient-to-b from-secondary to-primary text-white "
                                >
                                    +
                                </button>
                            </div>

                            {/* 3. EXCHANGE ICON (Center) */}
                            <div className="flex-shrink-0 w-10 flex justify-center">
                                <img src={exchangeImg} alt="exchange" />
                            </div>

                            {/* RIGHT SIDE: (4) - 50% Width */}
                            <div className="w-1/2 flex gap-2">
                                <select
                                    className="w-2/5 p-2.25 text-sm border border-gray-500  rounded outline-none truncate"
                                    value={item.selectedNewProductId}
                                    onChange={(e) => handleRowChange(index, "selectedNewProductId", e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.filter(p => p.categoryName === "All").map((p) => (
                                        <option key={p.id || p.serverId} value={p.id || p.serverId}>{p.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    min="1"
                                    className="w-1/5 border rounded border-gray-500 text-center text-[#555555] p-2.25 text-sm placeholder:text-[#555555]"
                                    value={item.newQty || ""}
                                    onChange={(e) =>
                                        handleRowChange(
                                            index,
                                            "newQty",
                                            Number(e.target.value)
                                        )
                                    }
                                />

                                <input
                                    type="number"
                                    placeholder="Unit Price"
                                    min="1"
                                    className=" w-1/5 border rounded border-gray-500 text-[#555555] py-2.25 text-sm text-center placeholder:text-[#555555]"
                                    value={item.newUnitValue || ""}
                                    onChange={(e) => handleRowChange(index, "newUnitValue", parseFloat(e.target.value) || 0)}
                                    readOnly
                                />

                                <input
                                    type="number"
                                    placeholder="Discount%"
                                    min="0"
                                    className="w-1/5 border rounded border-gray-500 text-[#555555]  placeholder:text-[#555555] py-2.25 text-sm text-center"
                                    value={item.newDiscount || ""}
                                    onChange={(e) => handleRowChange(index, "newDiscount", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calculation Grid */}
                <div className=" pt-4 border-t border-gray-200">
                    <div className="fborder-t border-gray-300 py-4
                flex flex-col sm:flex-row sm:justify-between gap-4">
                        {/* Left side: Only Checkbox */}
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox"
                                checked={restock}
                                onChange={(e) => setRestock(e.target.checked)}
                            />
                            Restock items
                        </label>

                        {/* Right side: Calculations */}
                        <div className="flex gap-12 text-sm text-[#15b71a]">
                            <div className="flex flex-col text-left ">
                                <span>Prev. Total:</span>
                                <span>Old Item Price:</span>
                                <span>New Item Price:</span>
                                <span>Refund:</span>
                                <span>Receive:</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span>P{prevtotalOldValue.toFixed(2)}</span>
                                <span>P{totalOldValue.toFixed(2)}</span>
                                <span>P{totalNewValue.toFixed(2)}</span>
                                <span>P{refundAmount.toFixed(2)}</span>
                                <span>P{receiveAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-1 text-sm">
                    <button className={`flex-1 bg-gradient-to-b from-secondary to-primary text-white font-bold py-2.5 rounded-md ${isExchangeDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                        : " hover:bg-none hover:bg-secondary cursor-pointer "
                        }`}
                        disabled={isExchangeDisabled}
                        onClick={handleFinalSubmit}>
                        Exchange
                    </button>
                    <button className="flex-1 font-bold py-2.5 border-gray-300 rounded-md  outline-none shadow-[0_0_3px_#00000026] hover:bg-gray-200 hover:shadow-none cursor-pointer" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExchangePopup;