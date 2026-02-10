import { useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useNotification } from "../../../hooks/useNotification";
import { useHoldOrderStore } from "../../../store/useHoldOrderStore";

const DiscountHoldOrderPopup = ({activeModal, closeModal, subtotal, tax, discount, total}) => {
    const [showDiscount, setShowDiscount] = useState(false);
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState(0.00);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [waiterName, setWaiterName] = useState("");
     const { createHoldOrder } = useHoldOrderStore();

    const { notifyError, notifySuccess } = useNotification();
    const {
        cartData,
        resetCart,
        selectedCustomer,
        selectedTable,
        setManagerDiscount,
    } = useCartStore();

    const handleLoginChange = (e) => {
        const { placeholder, value } = e.target;
        const field = e.target.name;
        setLoginData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const managerLoginHandler = () => {
        if (!loginData.username || !loginData.password) {
            notifyError("Username and Password is required");
            return;
        } else {
            closeModal();
            setShowDiscount(true);
            setLoginData({ username: '', password: '' })
            notifySuccess("Manager loged In")
        }
    }
    const saveDiscountHandler = () => {
        const discountData = discountType === "percentage" ? discountValue / 100 : discountValue;
        setManagerDiscount(discountData);
        notifySuccess("Discount Applied");
        setShowDiscount(false);
    }

    const handleHoldOrder = async () => {
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
            setWaiterName(waiterName);
            closeModal();
            notifySuccess("Order placed on hold");
        } catch (err) {
            console.log(err);
            
            notifyError("Failed to hold order");
        }
    };
    return (
        <>
         {/* // maneger login popup */}
            {
                activeModal === 'discount' && (
                    <div onClick={closeModal} className="fixed inset-0 z-1000 flex items-center justify-center bg-black/20">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                            <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Store Manager Login</h2>
                            <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Enter store manager username" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm" />
                            <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter store manager password" className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm" />
                            <div className="flex justify-between gap-2 text-[#555555]">
                                <button onClick={managerLoginHandler} className=" flex-1 px-4 py-2 bg-primary text-white rounded">Login</button>
                                <button onClick={closeModal} className=" flex-1 px-4 py-2 rounded text-sm font-bold shadow-[0_0_3px_#00000028]">X Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
    {/* // discount value popup */}
            {
                showDiscount && (
                    <div onClick={() => setShowDiscount(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                            <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Apply Discount</h2>
                            <div className="text-center text-lg font-semibold text-[#555555] py-4 space-y-2 my-6 rounded-md">
                                <p>Select Discount Type</p>
                                <div className="flex justify-center gap-2 text-sm text-white font-light">
                                    <div className={`cursor-not-allowed  py-2.5 px-4 rounded-md ${discountType == "fixed" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Fixed</div>
                                    {/* <div onClick={() => setDiscountType("fixed")} className={`cursor-not-allowed  py-2.5 px-4 rounded-md ${discountType == "fixed" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Fixed</div> */}
                                    <div onClick={() => setDiscountType("percentage")} className={`cursor-pointer py-2.5 px-4 rounded-md ${discountType == "percentage" ? "bg-gradient-to-b from-secondary to-primary text-white" : "shadow-[0_0_3px_#00000028] text-[#555555] bg-white"}`}>Percentage</div>
                                </div>
                            </div>
                            <input
                                type="number"
                                placeholder={discountType == "percentage" ? "Enter Discount Percentage" : "Enter Discount value"}
                                onChange={(e) => { setDiscountValue(e.target.value) }}
                                className="shadow-[0_0_3px_#00000028] w-full mb-6 p-3  font-light rounded-md placeholder:text-sm outline-none text-sm"
                            />
                            <div className="flex justify-between gap-4">
                                <button onClick={saveDiscountHandler} className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                                <button onClick={() => setShowDiscount(false)} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Hold Order Popup */}
            {
                activeModal === 'holdOrder' && (
                    <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl w-100 animate-scale-in">
                            <h2 className="text-2xl font-bold mb-4 text-[#555555] text-center">Hold Order</h2>
                            <input
                                type="text"
                                placeholder="Enter Customer's Name"
                                onChange={(e) => { setWaiterName(e.target.value) }}
                                className="shadow-[0_0_3px_#00000028] w-full mb-6 p-2 rounded-md placeholder:text-sm outline-none text-sm"
                            />
                            <div className="flex justify-between gap-4">
                                <button onClick={handleHoldOrder} className="px-4 py-2.5 text-white font-bold text-sm rounded flex-1 bg-gradient-to-b from-secondary to-primary cursor-pointer">+ Add</button>
                                <button onClick={closeModal} className="px-4 py-2.5 text-[#555555] text-sm font-bold rounded flex-1 shadow-[0_0_3px_#00000028] cursor-pointer">X Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default DiscountHoldOrderPopup;