// import { ShoppingCart, RefreshCcw, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "../../../store/useCustomerStore";
import { useProductStore } from "../../../store/useProductStore";
import { useCartStore } from "../../../store/useCartStore";
import Select from "react-select";
import { useEffect } from "react";
import { useRetail } from "../../../hooks/useretail";
import { useNotification } from "../../../hooks/useNotification";
import { useAuthStore } from "../../../store/useAuthStore";
import { usePromotionStore } from "../../../store/usePromotionStore";

const RightPanel = ({ total, setPayToProceed, getFinalProductPrice }) => {
    const navigate = useNavigate();
    const { customers, hydrate: customerHydrate } = useCustomerStore();
    const { products, hydrated: productsHydrated, hydrate: productsHydrate } = useProductStore();
    const { selectedCustomer, setSelectedCustomer, addToCart, cartData, resetCart, managerDiscount } = useCartStore();
    const { setIsRetail, setIsRetailOpen } = useRetail();
    const { notifyError } = useNotification();
    const tax = 0.00;
    const discount = Number(managerDiscount) < 1 ?((total + tax) * (managerDiscount)).toFixed(2): Number(managerDiscount).toFixed(2);

    
        //promotions
        const outletId = useAuthStore.getState().user?.outlet_id;
        const { promotions, hydrate: promoHydrate, hydrated: promoHydarated } = usePromotionStore();
    // --- fatching customers and products data when component mounts ---
    useEffect(() => {
        customerHydrate();
        productsHydrate();
    }, [productsHydrate, customerHydrate])
    useEffect(() => {
        console.log(customers);
        console.log(products);
    }, [customers, products])

    // --- Data Formatting for Searchable Select ---
    const customerOptions = [
    // The "Reset" option
    { value: "default", label: "Select Customer", data: {} }, 
    ...(customers?.map(c => ({
        value: c.serverId,
        label: `${c.firstName} ${c.lastName}`,
        data: c
    })) || [])
];

    const productOptions = products?.map(p => ({
        value: p?.serverId,
        label: p?.name || "Unknown Product",
        data: p // Keep original object
    }));

    // --- Custom Styles to match your existing UI ---
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: '0 0 3px #00000028',
            borderRadius: '0.375rem', // rounded-md
            fontSize: '0.875rem', // text-sm
            padding: '2px',
            cursor: 'pointer'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#555555'
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    const handleProductSelect = (data) => {
        const price = getFinalProductPrice({
                      product: data,
                      promotions,
                      outletId,
                    });
        const discount = price < data.sellingPrice ? data.sellingPrice-price : 0
                    
        const addToCartData = {
            id: data.serverId,
            img: data.img,
            name: data.name,
            price: price,
            stock: data.stock,
            stockQueue: data.stockQueue,
            unit: data.unit,
            barcode: data.barcode,
            discount: discount
        }
        const result = addToCart(addToCartData);
        if (result?.success === false) {
            if (result.reason === "OUT_OF_STOCK") {
                notifyError(<>
                    Only <span style={{ color: "red" }}>{data.stock + data.stockQueue}</span> items available in
                    <br />
                    stock for {data.name}
                </>);
            }
            return;
        }
    }

    const handleProceed = () => {
        if (cartData.length === 0) {
            notifyError("Please add items in the cart");
            return;
        }
        setIsRetailOpen(false);
        setPayToProceed(true);
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-md text-[#555555]">

            {/* HEADER (STICKY TOP) */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-300 p-4">
                <div className="flex items-center justify-between">

                    {/* Left Icons */}
                    <div className="flex gap-2">
                        <div className="cart-icons p-2 border border-gray-300 rounded-md cursor-pointer" onClick={() => { setIsRetail(false); setIsRetailOpen(false); }}>
                            <svg
                                viewBox="0 0 1024 1024"
                                focusable="false"
                                data-icon="shopping-cart"
                                width="24"
                                height="24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M922.9 701.9H327.4l29.9-60.9 496.8-.9c16.8 0 31.2-12 34.2-28.6l68.8-385.1c1.8-10.1-.9-20.5-7.5-28.4a34.99 34.99 0 00-26.6-12.5l-632-2.1-5.4-25.4c-3.4-16.2-18-28-34.6-28H96.5a35.3 35.3 0 100 70.6h125.9L246 312.8l58.1 281.3-74.8 122.1a34.96 34.96 0 00-3 36.8c6 11.9 18.1 19.4 31.5 19.4h62.8a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7h161.1a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7H923c19.4 0 35.3-15.8 35.3-35.3a35.42 35.42 0 00-35.4-35.2zM305.7 253l575.8 1.9-56.4 315.8-452.3.8L305.7 253zm96.9 612.7c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6zm325.1 0c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6z"></path>
                            </svg>
                        </div>
                        <div className="reset-icons p-2 border border-gray-300 rounded-md cursor-pointer" onClick={() => resetCart()}>
                            <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="redo"
                                width="24"
                                height="24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M758.2 839.1C851.8 765.9 912 651.9 912 523.9 912 303 733.5 124.3 512.6 124 291.4 123.7 112 302.8 112 523.9c0 125.2 57.5 236.9 147.6 310.2 3.5 2.8 8.6 2.2 11.4-1.3l39.4-50.5c2.7-3.4 2.1-8.3-1.2-11.1-8.1-6.6-15.9-13.7-23.4-21.2a318.64 318.64 0 01-68.6-101.7C200.4 609 192 567.1 192 523.9s8.4-85.1 25.1-124.5c16.1-38.1 39.2-72.3 68.6-101.7 29.4-29.4 63.6-52.5 101.7-68.6C426.9 212.4 468.8 204 512 204s85.1 8.4 124.5 25.1c38.1 16.1 72.3 39.2 101.7 68.6 29.4 29.4 52.5 63.6 68.6 101.7 16.7 39.4 25.1 81.3 25.1 124.5s-8.4 85.1-25.1 124.5a318.64 318.64 0 01-68.6 101.7c-9.3 9.3-19.1 18-29.3 26L668.2 724a8 8 0 00-14.1 3l-39.6 162.2c-1.2 5 2.6 9.9 7.7 9.9l167 .8c6.7 0 10.5-7.7 6.3-12.9l-37.3-47.9z"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-md text-white rounded-md bg-gradient-to-b from-secondary to-primary cursor-pointer">
                            <p className="text-sm">{selectedCustomer?.firstName ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "Select Customer"}</p>
                            <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="edit"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z"></path>
                            </svg>
                        </button>

                        <button className="w-10 h-10 flex text-2xl items-center justify-center text-white rounded-md bg-gradient-to-b from-secondary to-primary cursor-pointer">
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE MIDDLE SPACE */}
            <div className="flex-1 z-10 overflow-y-auto px-4">
                <div className="flex z-60 flex-col gap-4 mt-4">

                    {/* SEARCHABLE CUSTOMER DROPDOWN */}
                    <Select
                        options={customerOptions}
                        placeholder="Select Customer"
                        styles={customSelectStyles}
                        value={customerOptions?.find(opt => (selectedCustomer?.serverId && opt.value === selectedCustomer.serverId) || null)}
                        onChange={(selected) => setSelectedCustomer(selected.data)}
                        isSearchable
                        menuPortalTarget={document.body}
                    />

                    {/* SEARCHABLE PRODUCT DROPDOWN */}
                    <Select
                        options={productOptions}
                        placeholder="Select Product"
                        styles={customSelectStyles}
                        value={null} // Keep as null so it resets after adding to cart
                        onChange={(selected) => handleProductSelect(selected.data)}
                        isSearchable
                        menuPortalTarget={document.body}
                        formatOptionLabel={(option) => (
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">{option.data.name}</span>
                                    <div className="text-xs text-gray-400">Code: {option.data.barcode}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-primary">P{option.data.sellingPrice}</div>
                                    <div className="text-xs text-gray-400">
                                        Stock: <span className="font-semibold">{option.data.stock}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    />

                </div>
            </div>

            {/* FOOTER (STICKY BOTTOM) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-300 px-4 py-2 text-sm z-10">

                {/* SUMMARY */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>P{total ||0.00}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>P{tax}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount</span>
                        {/* <span>P{managerDiscount ? managerDiscount : 0.00}</span> */}
                        <span>P{discount}</span>
                    </div>
                </div>

                {/* 6 ACTION BUTTONS */}

                <div className="cart-btns mt-4 flex gap-2">
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer" onClick={() => navigate("/pos/invoices")}>
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="swap"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path>
                        </svg>
                        <p>Invoice</p>
                    </div>
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer" onClick={() => navigate("/pos/promotions")}>
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="swap"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path>
                        </svg>
                        <p>Promotion</p>
                    </div>
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer" onClick={() => navigate("/pos/lowstock")}>
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="swap"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path>
                        </svg>
                        <p>Low Stock</p>
                    </div>
                </div>
                <div className="cart-btns mt-4 flex gap-2">
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer" >
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="percentage"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M855.7 210.8l-42.4-42.4a8.03 8.03 0 00-11.3 0L168.3 801.9a8.03 8.03 0 000 11.3l42.4 42.4c3.1 3.1 8.2 3.1 11.3 0L855.6 222c3.2-3 3.2-8.1.1-11.2zM304 448c79.4 0 144-64.6 144-144s-64.6-144-144-144-144 64.6-144 144 64.6 144 144 144zm0-216c39.7 0 72 32.3 72 72s-32.3 72-72 72-72-32.3-72-72 32.3-72 72-72zm416 344c-79.4 0-144 64.6-144 144s64.6 144 144 144 144-64.6 144-144-64.6-144-144-144zm0 216c-39.7 0-72-32.3-72-72s32.3-72 72-72 72 32.3 72 72-32.3 72-72 72z"></path>
                        </svg>
                        <p>Discount</p>
                    </div>
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer" onClick={() => navigate("/pos/invoices")}>
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="swap"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M938 458.8l-29.6-312.6c-1.5-16.2-14.4-29-30.6-30.6L565.2 86h-.4c-3.2 0-5.7 1-7.6 2.9L88.9 557.2a9.96 9.96 0 000 14.1l363.8 363.8c1.9 1.9 4.4 2.9 7.1 2.9s5.2-1 7.1-2.9l468.3-468.3c2-2.1 3-5 2.8-8zM699 387c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path>
                        </svg>
                        <p>Exchange</p>
                    </div>
                    <div className="discount w-full bg-button-background p-4 fill-gray-700 text-gray-700 rounded-lg cursor-pointer">
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="pause"
                            width="24"
                            height="24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z"></path>
                        </svg>
                        <p>Hold Order</p>
                    </div>
                </div>
                <div className="cart-checkout flex justify-between items-center bg-gradient-to-b from-primary to-secondary text-white p-4 mt-4 rounded-lg  cursor-pointer" onClick={handleProceed}>
                    <div className="proceed">
                        <h3 className="text-xl font-semibold">Proceed to Pay</h3>
                        <h4 className="text-sm">Total Items {cartData.length}</h4>
                    </div>
                    <div className="proceed flex gap-2 items-center">
                        <div className="price text-xl font-semibold">P{total-discount}</div>
                        <div className="icon">
                            <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="double-right"
                                width="32"
                                height="32"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1A7.98 7.98 0 00188 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5zm304 0L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1A7.98 7.98 0 00492 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
