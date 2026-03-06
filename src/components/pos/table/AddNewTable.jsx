import { useState, useRef, useEffect } from "react";
import LoadingBar from "../../common/LoadingBar/LoadingBar";
const AddNewTable = ({ onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const resetForm = () => {
    setTableNumber("");
    setSeats("");
    firstInputRef.current?.focus();
  };

  const isSaveDisabled = !tableNumber || !seats;

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // 1. Updated to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    if (isSaveDisabled) return;
    setIsLoading(true);
    await onSave({
      tableNumber: Number(tableNumber),
      seats: Number(seats),
    });

    resetForm();
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <LoadingBar isLoading={isLoading} />
      {/* 2. Change div to form */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg animate-scale-in"
      >
        <h2 className="text-2xl font-semibold text-[#555555] mb-5 text-center">
          Add New Table
        </h2>

        <div className="flex flex-col gap-6">
          <input
            type="number"
            ref={firstInputRef}
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
          {/* 3. Explicitly set type="submit" */}
          <button
            type="submit"
            disabled={isSaveDisabled || isLoading}
            className={`px-4 py-2 w-1/3 rounded text-white bg-gradient-to-b from-secondary to-primary
              ${isSaveDisabled || isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
          >
            {isLoading? "saving..." : "Save"}
          </button>

          {/* 4. Set type="button" for non-submitting buttons to prevent accidental triggers */}
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 w-1/3 bg-gradient-to-b from-primary to-secondary text-white rounded font-bold"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 w-1/3 text-[#555555] font-bold shadow rounded"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewTable;