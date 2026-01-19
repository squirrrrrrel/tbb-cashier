import { useState } from "react";
import { useNotification } from "../../../hooks/useNotification";

const AddNewTable = ({ onClose, onSave }) => {
    const [tableNumber, setTableNumber] = useState("");
    const [seats, setSeats] = useState("");
    const {notifyError} = useNotification();

    const resetForm = () => {
        setTableNumber("");
        setSeats("");
    };

    const isSaveDisabled = !tableNumber || !seats;


    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!tableNumber || !seats) return;

        if(tableNumber == 0 || seats == 0){
            notifyError("Table No. and No. of Seat can not be Zero(0)");
            return;
        }

        onSave({
            tableNumber,
            seats,
        });

        resetForm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={handleCancel}
        >
            {/* Popup */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg "
            >
                {/* Heading */}
                <h2 className="text-2xl font-semibold text-[#555555] mb-5 text-center">
                    Add New Table
                </h2>

                {/* Inputs */}
                <div className="flex flex-col gap-6">
                    <input
                        type="number"
                        placeholder="Enter Table Number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="rounded px-3 py-2 shadow-[0_0_3px_#00000026] outline-none placeholder:text-sm"
                    />

                    <input
                        type="number"
                        placeholder="Enter Number of Seats"
                        value={seats}
                        onChange={(e) => setSeats(e.target.value)}
                        className="rounded px-3 py-2 shadow-[0_0_3px_#00000026] outline-none placeholder:text-sm"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={`px-4 py-2 w-1/3 rounded text-white bg-gradient-to-b from-secondary to-primary transition-all
                            ${isSaveDisabled
                                ? "opacity-80 cursor-not-allowed "
                                : "cursor-pointer"
                            }`}
                    >
                        Save
                    </button>


                    <button
                        onClick={resetForm}
                        className="px-4 py-2 w-1/3 bg-gradient-to-b from-primary to-secondary text-white text-gray-700 rounded cursor-pointer font-bold"
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 w-1/3 text-[#555555] font-bold cursor-pointer shadow-[0_0_3px_#00000026] rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewTable;
