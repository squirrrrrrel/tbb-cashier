import React from "react";
import LeftPanel from "../../components/pos/retail/LeftPanel";
import RightPanel from "../../components/pos/retail/RightPanel";
import qKartLogo from "../../assets/images/qKarts-logo.png";

const Retail = ({ setIsRetail }) => {


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="w-2/3 border-r-1 border-gray-300 h-full" >
                <div className="p-5 flex gap-8 items-center text-[#555555]">
                    <div><img className="w-40" src={qKartLogo} alt="logo" /></div>
                    <div className="font-bold text-3xl text-right flex-1"><h3>Cashier Panel</h3></div>
                </div>
                <div className="p-5 flex items-center gap-3 space-between">
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
                            placeholder="Search Barcode"
                            className="py-2 pl-8 bg-white w-full rounded-md shadow-[0_0_3px_#00000026] outline-0 cursor-text placeholder:text-[#555555] placeholder:text-sm"
                        />
                    </div>
                    <div className="w-1/4 flex justify-between items-center text-[#555555]">
                        <div className="flex gap-3">
                            <span onClick={() => setIsRetail(false)} className="cursor-pointer rounded-md shadow-[0_0_3px_#00000026] text-3xl font-light px-2.75 py-0.5">+</span>
                            <span className="cursor-pointer rounded-md shadow-[0_0_3px_#00000026] m-auto p-2.5">
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
                            0 Results
                        </div>
                    </div>
                </div>
                <div>
                    <LeftPanel />
                </div>
            </div>
            <div className="w-1/3 h-full">
                <RightPanel setIsRetail={setIsRetail} />
            </div>
        </div>
    );
};

export default Retail;