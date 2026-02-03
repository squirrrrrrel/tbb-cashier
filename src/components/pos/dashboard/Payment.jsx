import { useEffect, useState, useRef } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { usePaymentMethodStore } from "../../../store/usePaymentMethodStore";
import { useRetail } from "../../../hooks/useretail";

export const Payment = ({ setPayToProceed, total, onPay, tax, discount, subtotal, cartProducts }) => {
    const { paymentMethods, hydrate, hydrated } = usePaymentMethodStore();

    useEffect(() => {
        if (!hydrated) {
            hydrate();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const buttonBase = "py-5 shadow-[0_0_3px_#00000028] transition-all duration-200 cursor-pointer border-2 border-transparent";
    const hoverStyle = "hover:border-secondary hover:text-secondary";
    const [payingAmount, setPayingAmount] = useState("");
    const defaultPaymentMethodId = paymentMethods.length > 0 ? paymentMethods[0].id : null;
    const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethodId);
    const { isRetail, setIsRetail, isRetailOpen, setIsRetailOpen } = useRetail();
    const inputRef = useRef(null);
    
    const isPayDisabled = !payingAmount || parseFloat(payingAmount) < total;

    // Update payment method when payment methods are loaded
    useEffect(() => {
        if (paymentMethods.length > 0 && !paymentMethod) {
            setPaymentMethod(paymentMethods[0].id);
        }
        setPayLeft(total)
    }, [paymentMethods, paymentMethod, total]);
    const [payLeft, setPayLeft] = useState(total);
    const [change, setChange] = useState("0.00");
    const { selectedTable, selectedCustomer } = useCartStore();

    const handleNumpadClick = (val) => {
        setPayingAmount((prev) => {
            // 1. If clicking a dot and one already exists, do nothing
            if (val === "." && prev.includes(".")) return prev;

            // 2. If starting with a dot, automatically add a zero (looks cleaner: "0.")
            if (val === "." && prev === "") return "0.";

            // 3. Otherwise, append the value
            return prev + val;
        });
    };

    const handleBoxClick = (val) => {
        setPayingAmount(val);
    }

    useEffect(() => {
        if (!payingAmount) {
            setPayLeft(total);
            setChange("0.00");
        }
        else if (parseFloat(payingAmount) < total) {
            setPayLeft((total - parseFloat(payingAmount)).toFixed(2));
            setChange("0.00");
        } else {
            setPayLeft(0.00);
            setChange((parseFloat(payingAmount) - total).toFixed(2));
        }
    }, [payingAmount])

    const handleClear = () => setPayingAmount("");

    const handleBackspace = () => {
        setPayingAmount((prev) => {
            if (prev === null || prev === undefined) return prev;

            const valueAsString = String(prev);

            const newValue = valueAsString.slice(0, -1);

            // return number if original was number, else string
            return typeof prev === "number"
                ? Number(newValue || 0)
                : newValue;
        });
    };

    const handlePay = () => {
        if (isPayDisabled) return;
        const finalOrderData = {
            customerData: { ...selectedCustomer },
            tableData: { ...selectedTable },
            date: Date.now(),
            orderItems: [...cartProducts],
            subtotal: subtotal,
            discount: discount,
            tenderedAmount: parseFloat(payingAmount) || 0,
            cashReturned: parseFloat(change) || 0,
            paymentMethods: [{
                paymentMethodId: paymentMethod,
                amount: parseFloat(payingAmount) || total
            }],
            paymentMethodId: paymentMethod // Keep for backward compatibility
        }
        onPay(finalOrderData);
    }


    const HandleGoBack = () => {
        setPayToProceed(false);
        if (isRetail || isRetailOpen) {
            setIsRetail(true);
            setIsRetailOpen(true);
        }
    }

    return (
        <div>
            <div className="flex justify-between px-5 py-3 gap-6 text-[#555555] font-bold text-center">
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Total Due</div>
                    <div className="text-secondary text-3xl">P{total}</div>
                </div>
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Total Paying</div>
                    <div className="text-[#15b71a] text-3xl">P{payingAmount ? payingAmount : "0.00"}</div>
                </div>
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Pay Left</div>
                    <div className="text-[#d42c20] text-3xl">P{payLeft ? payLeft : "0.00"}</div>
                </div>
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Change</div>
                    <div className="text-[#ffa500] text-3xl">P{change ? change : "0.00"}</div>
                </div>
            </div>
            <div className="flex gap-6 px-5 py-3">
                <div onClick={HandleGoBack} className="bg-gradient-to-b from-secondary to-primary h-12 w-15 text-white rounded-md flex justify-center items-center cursor-pointer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="bg-white w-full shadow-[0_0_3px_#00000028] rounded-md py-4 px-3 mb-4">
                        <div className="flex justify-left text-[#555555] font-bold gap-4 p-2">
                            <p className="flex-1">Amount</p>
                            <p className="flex-1">Method</p>
                        </div>
                        <div className="flex justify-between gap-4 bg-[#f8f8f8] p-2">
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={payingAmount}
                                placeholder="0.00"
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
                                        setPayingAmount(inputValue);
                                    }
                                }}
                                className="flex-1 outline-secondary rounded-md py-3 px-4 text-sm bg-white shadow-[0_0_3px_#00000028]" />
                            <select
                                value={paymentMethod || ""}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="flex-1 outline-none rounded-md py-3 px-4 text-sm bg-white shadow-[0_0_3px_#00000028] cursor-pointer"
                            >
                                {paymentMethods.length > 0 ? (
                                    paymentMethods.map((pm) => (
                                        <option key={pm.id} value={pm.id}>
                                            {pm.display_name || pm.payment_method_name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Loading payment methods...</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="bg-white py-4 px-3 shadow-[0_0_3px_#00000028] rounded-md text-[#555555] font-bold text-sm text-center">

                        <div className="flex justify-between gap-5 mb-4">
                            <div onClick={() => handleBoxClick(total)} className={`${buttonBase} ${hoverStyle} flex-1`} >P{total}</div>
                            <div onClick={() => handleBoxClick(Math.ceil(total))} className={`${buttonBase} ${hoverStyle} flex-1`}>P{Math.ceil(total)}</div>
                            <div onClick={() => handleBoxClick(Math.ceil(total / 10) * 10)} className={`${buttonBase} ${hoverStyle} flex-1`}>P{Math.ceil(total / 10) * 10}</div>
                            <div onClick={() => handleBoxClick(Math.ceil(total / 100) * 100)} className={`${buttonBase} ${hoverStyle} flex-1`}>P{Math.ceil(total / 100) * 100}</div>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("1")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>1</div>
                                <div onClick={() => handleNumpadClick("2")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>2</div>
                                <div onClick={() => handleNumpadClick("3")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>3</div>
                                <div onClick={handleClear} className={`w-2/5 ${buttonBase} ${hoverStyle}`}>Clear</div>
                            </div>

                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("4")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>4</div>
                                <div onClick={() => handleNumpadClick("5")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>5</div>
                                <div onClick={() => handleNumpadClick("6")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>6</div>
                                <div onClick={handleBackspace} className={`w-2/5 flex justify-center items-center ${buttonBase} ${hoverStyle}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("7")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>7</div>
                                <div onClick={() => handleNumpadClick("8")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>8</div>
                                <div onClick={() => handleNumpadClick("9")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>9</div>
                                <div disabled={isPayDisabled} onClick={handlePay} className={`w-2/5  bg-gradient-to-b from-secondary to-primary text-white shadow-none py-5 ${isPayDisabled ? " opacity-50" : "cursor-pointer"}`}>Pay</div>
                            </div>

                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("0")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>0</div>
                                <div onClick={() => handleNumpadClick(".")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>.</div>
                                <div onClick={() => handleNumpadClick("00")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>00</div>
                                <div className={`w-2/5 ${buttonBase} bg-[#f1eeee] hover:bg-[#E2DEDE]`}>Cancel</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}