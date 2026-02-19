import { useEffect, useState, useRef } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { usePaymentMethodStore } from "../../../store/usePaymentMethodStore";
import { useRetail } from "../../../hooks/useRetail";

export const Payment = ({ setPayToProceed, total, onPay, tax, discount, subtotal, cartProducts }) => {
    const { paymentMethods, hydrate, hydrated } = usePaymentMethodStore();
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!hydrated) {
            hydrate();
        }
    }, []);

    const buttonBase = "py-5 shadow-[0_0_3px_#00000028] transition-all duration-200 cursor-pointer border-2 border-transparent";
    const hoverStyle = "hover:border-secondary hover:text-secondary";

    const [splits, setSplits] = useState([
        { id: Date.now(), amount: "", methodId: "" }
    ]);

    const { isRetail, setIsRetail, isRetailOpen, setIsRetailOpen } = useRetail();
    const inputRef = useRef(null);

    const totalTendered = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const isPayDisabled = totalTendered < total;

    useEffect(() => {
        if (paymentMethods.length > 0 && splits[0].methodId === "") {
            const newSplits = [...splits];
            newSplits[0].methodId = paymentMethods[0].id;
            setSplits(newSplits);
        }
    }, [paymentMethods]);

    const [payLeft, setPayLeft] = useState(total);
    const [change, setChange] = useState("0.00");
    const { selectedTable, selectedCustomer } = useCartStore();

    // Helper to update a specific row
    const updateSplit = (id, field, value) => {
        setSplits(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // --- CHANGED: Handlers now target the LAST row added ---
    const handleNumpadClick = (val) => {
        const lastRow = splits[splits.length - 1];
        let prev = lastRow.amount;
        let newValue = prev;

        if (val === "." && prev.includes(".")) return;
        if (val === "." && prev === "") newValue = "0.";
        else newValue = prev + val;

        updateSplit(lastRow.id, "amount", newValue);
    };

    const handleBoxClick = (val) => {
        updateSplit(splits[splits.length - 1].id, "amount", val.toString());
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (totalTendered === 0) {
            setPayLeft(total);
            setChange("0.00");
        } else if (totalTendered < total) {
            setPayLeft((total - totalTendered).toFixed(2));
            setChange("0.00");
        } else {
            setPayLeft(0.00);
            setChange((totalTendered - total).toFixed(2));
        }
        if (inputRef.current) inputRef.current.focus();
    }, [totalTendered, total, splits]);

    const handleClear = () => updateSplit(splits[splits.length - 1].id, "amount", "");

    const handleBackspace = () => {
        const lastRow = splits[splits.length - 1];
        const newValue = String(lastRow.amount).slice(0, -1);
        updateSplit(lastRow.id, "amount", newValue);
    };

    const handlePay = async () => {
        if (isPaying || isPayDisabled) return;
        const finalOrderData = {
            customerData: { ...selectedCustomer },
            tableData: { ...selectedTable },
            date: Date.now(),
            orderItems: [...cartProducts],
            subtotal: subtotal,
            discount: discount,
            tenderedAmount: totalTendered,
            cashReturned: parseFloat(change) || 0,
            paymentMethods: splits.map(s => ({
                paymentMethodId: s.methodId,
                payment_tax_amount: tax,
                amount: parseFloat(s.amount) || 0
            }))
        };

        try {
            setIsPaying(true);
            await onPay(finalOrderData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsPaying(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!isPayDisabled && !isPaying) {
                handlePay();
            }
        }
    };

    const HandleGoBack = () => {
        setPayToProceed(false);
        if (isRetail || isRetailOpen) {
            setIsRetail(true);
            setIsRetailOpen(true);
        }
    };

    return (
        <div className="overflow-y-auto flex flex-col h-screen no-scrollbar">
            <div className="flex justify-between px-5 py-3 gap-6 text-[#555555] font-bold text-center">
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Total Due</div>
                    <div className="text-secondary text-3xl">P{total.toFixed(2)}</div>
                </div>
                {discount > 0 && (
                    <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white">
                        <div className="text-lg">Discount</div>
                        <div className="text-[#15b71a] text-3xl">
                            -P{(discount < 1 ? (subtotal + tax) * discount : discount).toFixed(2)}
                        </div>
                    </div>
                )}
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Total Paying</div>
                    <div className="text-[#15b71a] text-3xl">P{totalTendered.toFixed(2)}</div>
                </div>
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Pay Left</div>
                    <div className="text-[#d42c20] text-3xl">P{payLeft}</div>
                </div>
                <div className="flex-1 p-4 rounded-md shadow-[0_0_3px_#00000028] bg-white ">
                    <div className="text-lg">Change</div>
                    <div className="text-[#ffa500] text-3xl">P{change}</div>
                </div>
            </div>
            <div className="flex gap-6 px-5 py-3">
                <div onClick={HandleGoBack} className="bg-gradient-to-b from-secondary to-primary h-12 w-15 text-white rounded-md flex justify-center items-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                </div>
                <div className="flex-1">
                    <div className="bg-white w-full shadow-[0_0_3px_#00000028] rounded-md py-4 px-3 mb-4">
                        <div className="flex justify-left text-[#555555] font-bold gap-4 p-2">
                            <p className="flex-1">Amount</p>
                            <p className="flex-1">Method</p>
                        </div>

                        {/* --- LOOP: Dynamic Payment Rows --- */}
                        {splits.map((split, index) => (
                            <div key={split.id} className="flex justify-between gap-4 bg-[#f8f8f8] p-2 mb-2 rounded-md items-center">
                                <div className="w-full flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            ref={index === splits.length - 1 ? inputRef : null}
                                            type="text"
                                            inputMode="decimal"
                                            value={split.amount}
                                            placeholder="0.00"
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                    updateSplit(split.id, "amount", val);
                                                }
                                            }}
                                            className="w-full outline-secondary rounded-md py-3 px-4 text-sm bg-white shadow-[0_0_3px_#00000028]"
                                        />
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <select
                                            value={split.methodId}
                                            onChange={(e) => updateSplit(split.id, "methodId", e.target.value)}
                                            className="appearance-none flex-1 outline-none rounded-md py-3 pl-4 pr-10 text-sm bg-white shadow-[0_0_3px_#00000028] cursor-pointer"
                                            style={{
                                                // The %23 is the URL-encoded version of the # symbol
                                                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23555555%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 1rem center',
                                                backgroundSize: '0.8em auto'
                                            }}
                                        >
                                            {paymentMethods.map((pm) => (
                                                <option key={pm.id} value={pm.id}>
                                                    {pm.display_name || pm.payment_method_name}
                                                </option>
                                            ))}
                                        </select>
                                        {splits.length > 1 && index !== 0 && (
                                            <button
                                                onClick={() => setSplits(splits.filter(s => s.id !== split.id))}
                                                className="text-red-500 font-bold px-2 w-10"
                                            >
                                                <svg
                                                    viewBox="64 64 896 896"
                                                    focusable="false"
                                                    data-icon="delete"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-2">
                            <button
                                onClick={() => {
                                    const remaining = Math.max(0, total - totalTendered);
                                    setSplits([...splits, { id: Date.now(), amount: remaining > 0 ? remaining.toString() : "", methodId: paymentMethods[0]?.id }]);
                                }}
                                className="w-full bg-gradient-to-b from-secondary to-primary rounded-md py-2 font-bold text-white text-sm"
                            >
                                Add Another Payment Method
                            </button>
                        </div>
                    </div>
                    <div className="bg-white py-4 px-3 shadow-[0_0_3px_#00000028] rounded-md text-[#555555] font-bold text-sm text-center">
                        <div className="flex justify-between gap-5 mb-4">
                            <div onClick={() => handleBoxClick(total.toFixed(2))} className={`${buttonBase} ${hoverStyle} flex-1`} >P{total.toFixed(2)}</div>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("7")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>7</div>
                                <div onClick={() => handleNumpadClick("8")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>8</div>
                                <div onClick={() => handleNumpadClick("9")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>9</div>
                                <button onClick={!isPayDisabled && !isPaying ? handlePay : undefined} className={`w-2/5 bg-gradient-to-b from-secondary to-primary text-white shadow-none py-5 ${isPayDisabled || isPaying ? " opacity-50" : "cursor-pointer"}`}> {isPaying ? "Paying..." : "Pay"}</button>
                            </div>
                            <div className="flex justify-between">
                                <div onClick={() => handleNumpadClick("0")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>0</div>
                                <div onClick={() => handleNumpadClick(".")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>.</div>
                                <div onClick={() => handleNumpadClick("00")} className={`w-1/5 ${buttonBase} ${hoverStyle}`}>00</div>
                                <div onClick={HandleGoBack} className={`w-2/5 ${buttonBase} bg-[#f1eeee] hover:bg-[#E2DEDE]`}>Cancel</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}