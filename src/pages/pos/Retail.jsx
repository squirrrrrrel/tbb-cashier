import React from "react";
import LeftPanel from "../../components/pos/retail/LeftPanel";
import RightPanel from "../../components/pos/retail/RightPanel";
import qKartLogo from "../../assets/images/qkarts-logo.png";
import { useState } from "react";
import { useProductStore } from "../../store/useProductStore";
import { useCartStore } from "../../store/useCartStore";
import { useNotification } from "../../hooks/useNotification";
import { useRetail } from "../../hooks/useRetail";

const Retail = ({ setPayToProceed, getFinalProductPrice }) => {

    const { products } = useProductStore();

    const [barcodeSearch, setBarcodeSearch] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const {addToCart} = useCartStore();
    const [totalAmount, setTotalAmount] = useState(0);
    const {notifyError}=useNotification();
    const {setIsRetail, setIsRetailOpen} = useRetail();

    // --- Barcode Search Logic ---
    const handleBarcodeChange = (e) => {
        const value = e.target.value;
        setBarcodeSearch(value);

        if (value.length > 1) {
            const matches = products.filter((p) =>
                p.barcode?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredProducts(matches);
        } else {
            setFilteredProducts([]);
        }
    };

    // --- NEW: Handle Enter Key Press ---
const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        // Prevent form submission if this is inside a form
        e.preventDefault();

        // Find an EXACT match for the barcode
        const exactMatch = products.find(
            (p) => p.barcode?.toLowerCase() === barcodeSearch.toLowerCase()
        );

        if (exactMatch) {
            selectProduct(exactMatch)
        } else {
            // Optional: Alert the user if no exact match found on Enter
            console.log("No product found with this barcode");
        }
    }
};

    const selectProduct = (data) => {
        const addToCartData = {
            id: data.serverId,
            img: data.img,
            name: data.name,
            price: data.sellingPrice,
            stock: data.stock,
            stockQueue: data.stockQueue,
            unit: data.unit,
            barcode: data.barcode
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
        setBarcodeSearch("");
        setFilteredProducts([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex-grow  h-full p-5" >
                <div className="flex gap-8 items-center text-[#555555]">
                    <div><img className="w-36" src={qKartLogo} alt="logo" /></div>
                    {/* <div className="font-bold text-3xl text-right flex-1"><h3>Cashier Panel</h3></div> */}
                </div>
                <div className="mt-2 flex items-center gap-3 space-between">
                    <div className="relative w-3/4 flex items-center justify-between gap-2">
                        <svg
                            className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Scan or Type Barcode..."
                            className="py-2 pl-8 bg-white w-full rounded-md shadow-[0_0_3px_#00000026] outline-0 cursor-text placeholder:text-[#555555] placeholder:text-sm"
                        value={barcodeSearch}
                        onChange={handleBarcodeChange}
                        onKeyDown={handleKeyDown} // Listen for the Enter key
                        />

                        {/* BARCODE SEARCH POPUP */}
                        {filteredProducts.length > 0 && (
                            <div className="absolute left-0 right-0 top-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                {filteredProducts.map((p) => (
                                    <div
                                        key={p.serverId || p.barcode}
                                        className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-none"
                                        onClick={() => selectProduct(p)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{p.name}</span>
                                            <span className="text-xs text-gray-500">SN: {p.barcode}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-primary">P {p.sellingPrice}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-1/4 flex justify-between items-center text-[#555555]">
                        <div className="flex gap-3">
                            <span className="cursor-pointer rounded-md shadow-[0_0_3px_#00000026] text-3xl font-light px-2.75 py-0.5">+</span>
                            <span onClick={() => {setIsRetail(false); setIsRetailOpen(false);}} className="cursor-pointer rounded-md shadow-[0_0_3px_#00000026] m-auto p-2.5">
                                <svg
                                    className="w-5 h-5 text-[#555]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="7" width="18" height="14" rx="2" />
                                    <path d="M7 7l2-3h6l2 3" />
                                    <circle cx="12" cy="14" r="4" />
                                </svg>
                            </span>
                        </div>
                        <div>
                            {filteredProducts.length} Results
                        </div>
                    </div>
                </div>
                <div>
                    <LeftPanel setTotalAmount={setTotalAmount} getFinalProductPrice={getFinalProductPrice} />
                </div>
            </div>
            <div className="w-[35vw] h-full border-l-1 border-gray-200">
                <RightPanel total={totalAmount} setPayToProceed={setPayToProceed} getFinalProductPrice={getFinalProductPrice}/>
            </div>
        </div>
    );
};

export default Retail;