import { useState, useRef, useEffect } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useNotification } from "../../../hooks/useNotification";
import { useHoldOrderStore } from "../../../store/useHoldOrderStore";
import { useManagerAuth } from "../../../hooks/useManagerAuth";

const DiscountHoldOrderPopup = ({ activeModal, closeModal, subtotal, tax, discount, total, setPayToProceed }) => {
    const [showDiscount, setShowDiscount] = useState(false);
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState(0.00);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [waiterName, setWaiterName] = useState("");
    const { verify, isVerifying } = useManagerAuth();
    const { createHoldOrder } = useHoldOrderStore();
    // Refs for auto-focus
    const loginInputRef = useRef(null);
    const discountInputRef = useRef(null);
    const holdOrderInputRef = useRef(null);

    const { notifyError, notifySuccess } = useNotification();
    const {
        cartData,
        resetCart,
        selectedCustomer,
        selectedTable,
        setManagerDiscount,
    } = useCartStore();

    // Effect to focus the first input whenever a modal opens
    useEffect(() => {
        if (activeModal === 'discount') {
            loginInputRef.current?.focus();
        } else if (activeModal === 'holdOrder') {
            holdOrderInputRef.current?.focus();
        }
    }, [activeModal]);

    // Separate effect for the discount value popup (since it's controlled by showDiscount state)
    useEffect(() => {
        if (showDiscount) {
            // Small timeout ensures the DOM has rendered the new element
            setTimeout(() => discountInputRef.current?.focus(), 10);
        }
    }, [showDiscount]);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const managerLoginHandler = async (e) => {
        e?.preventDefault(); // Prevents page reload
        if (!loginData.username || !loginData.password) {
            notifyError("Username and Password are required");
            return;
        }
        const res = await verify(loginData.username, loginData.password);
        const { success, message } = res?.data || {};
        if (success) {
            notifySuccess("Manager Verified");
            setLoginData({ username: '', password: '' });
            closeModal();
            setShowDiscount(true);
        } else {
            notifyError(message);
        }
    };

    const saveDiscountHandler = (e) => {
        e?.preventDefault(); // Prevents page reload
        const discountData = discountType === "percentage" ? discountValue / 100 : discountValue;
        setManagerDiscount(discountData);
        notifySuccess("Discount Applied");
        setShowDiscount(false);
    }

    const handleHoldOrder = async (e) => {
        e?.preventDefault(); // Prevents page reload
        if (!cartData.length) {
            notifyError("Cart is empty");
            return;
        }

        if (!waiterName.trim()) {
            notifyError("Waiter name is required");
            return;
        }

        const holdOrderPayload = {
            localId: `HOLD-${Date.now()}`,
            timestamp: Date.now(),
            note: waiterName,
            isSynced: false,
            serverId: null,
            cartData: {
                customer: selectedCustomer,
                table: selectedTable,
                orderItems: cartData,
                subtotal,
                taxAmount: tax,
                discount: {
                    type: "FIXED",
                    value: discount,
                },
                totalAmountToPay: total,
            },
        };

        try {
            await createHoldOrder(holdOrderPayload);
            resetCart();
            setWaiterName("");
            closeModal();
            setPayToProceed(false);
            notifySuccess("Order placed on hold");
        } catch (err) {
            notifyError("Failed to hold order");
        }
    };

    return (
        <>
            {/* Manager Login Popup */}
            {activeModal === 'discount' && (
                <div onClick={closeModal} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={managerLoginHandler}
                        className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Store Manager Login</h2>
                        <input ref={loginInputRef} type="text" name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Enter store manager username" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md outline-none text-sm" />
                        <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter store manager password" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md outline-none text-sm" />
                        <div className="flex justify-between gap-2 text-[#555555]">
                            <button type="submit" disabled={isVerifying} className="flex-1 px-4 py-2 bg-primary text-white rounded cursor-pointer">
                                {isVerifying ? "Checking..." : "Login"}
                            </button>
                            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded text-sm font-bold shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Discount Value Popup */}
            {showDiscount && (
                <div onClick={() => setShowDiscount(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={saveDiscountHandler}
                        className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Apply Discount</h2>
                        <div className="text-center text-lg font-semibold text-[#555555] py-4 space-y-2 my-6 rounded-md">
                            <p>Select Discount Type</p>
                            <div className="flex justify-center gap-2 text-sm text-white font-light">
                                <button
                                    type="button"
                                    // onClick={() => setDiscountType("fixed")}
                                    onClick={() => notifyError("Fixed is dissabled for now")}
                                    className={`py-2.5 px-4 rounded-md cursor-pointer ${discountType === "fixed" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}
                                >
                                    Fixed
                                </button>
                                <button type="button" onClick={() => setDiscountType("percentage")} className={`py-2.5 px-4 rounded-md cursor-pointer ${discountType === "percentage" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Percentage</button>
                            </div>
                        </div>
                        <input
                            ref={discountInputRef}
                            type="number"
                            required
                            placeholder={discountType === "percentage" ? "Enter Discount Percentage" : "Enter Discount value"}
                            onChange={(e) => { setDiscountValue(e.target.value) }}
                            className="shadow-[0_0_3px_#00000028] w-full mb-6 p-3 font-light rounded-md outline-none text-sm"
                        />
                        <div className="flex justify-between gap-4">
                            <button type="submit" className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                            <button type="button" onClick={() => setShowDiscount(false)} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Hold Order Popup */}
            {activeModal === 'holdOrder' && (
                <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={handleHoldOrder}
                        className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Hold Order</h2>
                        <input
                            ref={holdOrderInputRef}
                            type="text"
                            required
                            placeholder="Enter Customer's Name"
                            onChange={(e) => { setWaiterName(e.target.value) }}
                            className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md outline-none text-sm"
                        />
                        <div className="flex justify-between gap-4">
                            <button type="submit" className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                            <button type="button" onClick={closeModal} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default DiscountHoldOrderPopup;