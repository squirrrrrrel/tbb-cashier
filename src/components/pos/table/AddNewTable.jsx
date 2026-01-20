import { useState } from "react";
import { useTableStore } from "../../../store/useTableStore";

const AddNewTable = ({ onClose }) => {
  const addTable = useTableStore((s) => s.addTable);

  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");

  const resetForm = () => {
    setTableNumber("");
    setSeats("");
  };

  const isSaveDisabled = !tableNumber || !seats;

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    await addTable({
      tableNumber: Number(tableNumber),
      seats: Number(seats),
    });

    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-[#555555] mb-5 text-center">
          Add New Table
        </h2>

        <div className="flex flex-col gap-6">
          <input
            type="number"
            placeholder="Enter Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="rounded px-3 py-2 shadow outline-none"
          />

          <input
            type="number"
            placeholder="Enter Number of Seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="rounded px-3 py-2 shadow outline-none"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`px-4 py-2 w-1/3 rounded text-white bg-gradient-to-b from-secondary to-primary
              ${isSaveDisabled ? "opacity-80 cursor-not-allowed" : ""}`}
          >
            Save
          </button>

          <button
            onClick={resetForm}
            className="px-4 py-2 w-1/3 bg-gradient-to-b from-primary to-secondary text-white rounded font-bold"
          >
            Reset
          </button>

          <button
            onClick={handleCancel}
            className="px-4 py-2 w-1/3 text-[#555555] font-bold shadow rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewTable;
