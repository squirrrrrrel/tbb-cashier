import React, { useEffect, useState } from "react";
import defaultImg from "./../../../assets/images/Default_Product_Img.png";
import { useNotification } from "./../../../hooks/useNotification"

const RefundPopup = ({ open, onClose, items = [], orderId, onProcessRefund }) => {
    const [refundItems, setRefundItems] = useState([]);
    const [restock, setRestock] = useState(true);
    const [reason, setReason] = useState("");
    const { notifyError, notifySuccess } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);



    useEffect(() => {
        // Only initialize/reset if the popup is opening AND we aren't currently processing a refund
        if (open && !isProcessing) {
            const filteredItems = items.filter(item => item.category_name !== "Butchery" && item.category_name !== "Shots")
                .map(item => ({
                    ...item,
                    refundQty: 0,
                }))
            setRefundItems(

                filteredItems.filter(item => item.productId && (item.quantity - item.refundQuantity) > 0)
            );
            setRestock(true);
            setReason("");
        }
    }, [open]);

    if (!open) return null;

    const updateQty = (index, type) => {
        setRefundItems(prev =>
            prev.map((item, i) => {
                if (i !== index) return item;

                let qty = item.refundQty;
                if (type === "inc" && qty < item.quantity - item.refundQuantity) qty++;
                if (type === "dec" && qty > 0) qty--;

                return { ...item, refundQty: qty };
            })
        );
    };

    const refundSubtotal = refundItems.reduce(
        (sum, i) => sum + i.refundQty * i.unitPrice,
        0
    );

    const refundTax = refundItems.reduce(
        (sum, i) => sum + (Number(i.taxPercentagePerProduct || 0) * i.refundQty * i.unitPrice / 100),
        0
    );
    const refundAmount = refundSubtotal + refundTax;

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async () => {
        // Filter items where quantity > 0
        const itemsToRefund = refundItems
            .filter(item => item.refundQty > 0)
            .map(item => ({
                order_item_id: item.orderItemId, // mapping your productId to orderItemId
                quantity: item.refundQty,
                refund_subtotal: refundSubtotal,
                refund_tax: refundTax,
                refund_total: refundAmount,
                discount_percentage: 0,
                tax_percentage: 0
            }));

        if (itemsToRefund.length === 0) return onClose();
        setIsProcessing(true);
        // Construct the RefundData interface
        const refundData = {
            order_id: orderId,
            items: itemsToRefund,
            restock: restock,
            reason: reason
        };
        // Calculate total value for this specific refund event
        const totalRefundValue = refundItems.reduce(
            (sum, i) => sum + i.refundQty * i.unitPrice,
            0
        );

        const totalRefundTax = refundItems.reduce(
            (sum, i) => sum + (Number(i.taxPercentagePerProduct || 0) * i.refundQty / 100),
            0
        );

        const totalRefundSubtotal = refundItems.reduce(
            (sum, i) => sum + i.refundQty * i.unitPrice,
            0
        );

        // Send back to Invoices.jsx
        try {
            await onProcessRefund(
                refundData,
                totalRefundValue + totalRefundTax,
                totalRefundSubtotal
            );
            notifySuccess("Product Refunded Successfully");
            onClose();
        } catch (error) {
            console.error("Refund failed:", error);
            notifyError("Refund failed:", error.message || error);
        } finally {
            setIsProcessing(false);
        }

    };



    return (
        <div
            className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center px-3 sm:px-6 md:px-12 lg:px-40 py-4 sm:py-10"
            onClick={handleClose}
        >
            <div className="bg-white w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[720px] lg:max-w-[900px] h-full rounded-lg shadow-xl p-7 flex flex-col animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Heading */}
                <h2 className="text-2xl text-center text-[#555555] font-bold mb-5">
                    Available Items for Refund
                </h2>

                {/* Item List */}
                <div className="flex-1  overflow-y-auto mb-4">
                    {refundItems.length === 0 && (
                        <p className="text-center text-sm py-6 text-gray-500">
                            No items available
                        </p>
                    )}

                    {refundItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center px-3 py-2 "
                        >
                            <div className="flex gap-2">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt="product img" className="h-10" />
                                ) : (
                                    <img src={defaultImg} alt="product img" className="h-10" />
                                )}
                                <div>
                                    <p className="text-md text-[#555555]">{item.productName}</p>
                                    <p className="text-sm text-[#555555] font-bold">
                                        P{item.unitPrice} X {item.quantity - (item.refundQuantity)} {item.unit}
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center">
                                <button
                                    onClick={() => updateQty(index, "dec")}
                                    className="w-8 h-9 font-bold bg-gradient-to-b from-secondary to-primary text-white"
                                >
                                    −
                                </button>
                                <span className="w-10 py-1.5 text-center border-y-1 border-gray-200 h-full">
                                    {item.refundQty}
                                </span>
                                <button
                                    onClick={() => updateQty(index, "inc")}
                                    className="w-8 h-9 font-bold bg-gradient-to-b from-secondary to-primary text-white"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* BOTTOM FIXED AREA */}
                <div className="mt-auto border-t border-gray-200">

                    {/* Restock & Summary */}
                    <div className="fborder-t border-gray-300 py-6
                flex flex-col sm:flex-row sm:justify-between gap-4">
                        <label className="flex items-center gap-2 text-sm text-[#555555]">
                            <input
                                type="checkbox"
                                checked={restock}
                                onChange={e => setRestock(e.target.checked)}
                            />
                            Restock items
                        </label>

                        <div className="text-sm text-right flex text-[#15b71a]">
                            <div className="text-left mr-8">
                                <p>Refund Subtotal:</p>
                                <p>Refund Tax:</p>
                                <p>Refund Amount:</p>
                            </div>

                            <div className="text-right">
                                <p>P{refundSubtotal.toFixed(2)}</p>
                                <p>P{refundTax.toFixed(2)}</p>
                                <p>P{refundAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-2.5 border-0 border-gray-300 rounded-md  outline-none placeholder:text-[#555555] shadow-[0_0_3px_#00000026] focus:outline-primary text-sm "
                            placeholder="Enter reason (optional)"
                        />
                    </div>

                    {/* Buttons */}
                    <div className=" flex flex-col sm:flex-row gap-5 mt-7">
                        <button
                            onClick={handleSubmit}
                            disabled={refundItems.every(i => i.refundQty === 0) || isProcessing}
                            className={`flex-1 font-bold py-2 rounded-md text-white bg-gradient-to-b from-secondary to-primary  transition-all ${(refundItems.every(i => i.refundQty === 0) || isProcessing)
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer"}`}
                        >
                            {isProcessing ? "Processing..." : "Refund"}
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 font-bold py-2 border-gray-300 rounded-md text-[#555555]  outline-none shadow-[0_0_3px_#00000026] hover:bg-gray-200 hover:shadow-none cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPopup;
