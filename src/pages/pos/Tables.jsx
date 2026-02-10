import React, { useState, useEffect } from "react";
import AddNewTable from "../../components/pos/table/AddNewTable";
import { useNotification } from "./../../hooks/useNotification";
import { useTableStore } from "../../store/useTableStore";
import { useCartStore } from "../../store/useCartStore";
import SearchBar from "../../components/searchBar/SearchBar";
import { useNavigate } from "react-router-dom";
const Tables = () => {
  const { tables, hydrate, hydrated, addTable, deleteTable } = useTableStore();
  const [addNewTableModal, setAddNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { selectedTable, setSelectedTable } = useCartStore();
  const { notifyError, notifySuccess } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  const handleAddNewTableModal = () => {
    setAddNewModal(true);
  };

  const handleAddNewTableCloseModal = () => {
    setAddNewModal(false);
  };

  const handleAddTableSave = async ({ tableNumber, seats }) => {
    try {
      await addTable({ tableNumber, seats });
      notifySuccess("Table Added");
    } catch {
      notifyError("Something went wrong");
    }
  };

  const handleDeleteTable = async (localId) => {
    try {
      await deleteTable(localId);
      notifySuccess("Table Deleted");
      if (selectedTable?.localId === localId) {
        setSelectedTable({});
      }
    } catch {
      notifyError("Something went wrong");
    }
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  const filteredTableList = tables
  .filter((item) => {
    if (filter === "occupied") return selectedTable?.localId && item.localId === selectedTable.localId;
    if (filter === "vacant") return !selectedTable?.localId || item.localId !== selectedTable.localId;
    return true;
  })
  .filter((item) =>
    item.tableNumber?.toString().includes(searchQuery) || ""
  );

  return (
    <div className="grid grid-cols-1 w-full h-screen">
      <div className="flex flex-col bg-background h-full overflow-hidden">
        {/* Tab Changer Header */}
        <div className="grid grid-cols-[repeat(4,150px)]  gap-3 bg-white p-2.5 shadow-[0_0_3px_0_rgba(0,0,0,0.15)]">
          {["all", "occupied", "vacant"].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`rounded-md border border-primary text-center text-lg font-semibold cursor-pointer transition-all
                ${filter === type
                  ? "bg-gradient-to-b from-primary to-secondary text-white"
                  : "text-primary hover:bg-gradient-to-b hover:from-primary hover:to-secondary hover:text-white"
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <button
            onClick={handleAddNewTableModal}
            className="rounded-md border border-primary p-1.5 text-center text-lg font-semibold text-primary hover:bg-gradient-to-b hover:from-primary hover:to-secondary hover:text-white cursor-pointer"
          >
            Add New Table
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">

          {/* Search Wrapper */}
          <div className="px-2.5 py-1 sticky  max-w-5xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search By Number of Seats..."
              resultCount={filteredTableList.length}
            />
          </div>


          {/* Tables Grid Wrapper */}
          {filteredTableList.length > 0 ? (
            <div className="flex flex-wrap gap-10 overflow-y-auto overflow-x-hidden py-5 px-3 h-full m-2">
              {filteredTableList.map((item) => {
                const isSelected = selectedTable?.localId === item?.localId;

                return (
                  <div className="group" key={item.localId}>
                    {/* Table Visual Card */}
                    <div className="relative p-2.5">
                      <div
                        className={`relative z-10 flex h-[120px] w-[150px] items-center justify-center rounded-[15px] text-center font-semibold shadow-[0_0_4px_0_rgba(0,0,0,0.11)] transition-all duration-300
                      ${isSelected
                            ? "bg-gradient-to-b from-secondary to-primary text-white"
                            : "bg-white text-secondary"}`}
                      >
                        <div className={`flex flex-col gap-1 text-secondary ${isSelected ? "text-white" : "text-[#117892]"}`}>
                          <h3 className="text-2xl">Table {item.tableNumber}</h3>
                          <p className={`text-md font-semibold `}>
                            Seats: {item.seats}
                          </p>
                        </div>

                        {/* Decorative Table  (Chair effect) */}
                        <span className={`absolute left-[40px] top-[-15px] h-2.5 w-[70px] rounded-md shadow-[0_0_6px_0_rgba(0,0,0,0.11)] 
                    ${isSelected
                            ? "bg-gradient-to-b from-secondary to-primary"
                            : "bg-white"}`}>
                        </span>
                        <span className={`absolute bottom-[-15px] left-[40px] h-2.5 w-[70px] rounded-md shadow-[0_0_6px_0_rgba(0,0,0,0.11)] 
                    ${isSelected
                            ? "bg-gradient-to-b from-secondary to-primary"
                            : "bg-white"}`}>
                        </span>
                        <span className={`absolute left-[-15px] top-[30px] h-[70px] w-2.5 rounded-md shadow-[0_0_6px_0_rgba(0,0,0,0.11)] 
                    ${isSelected
                            ? "bg-gradient-to-b from-secondary to-primary"
                            : "bg-white"}`}>
                        </span>
                        <span className={`absolute right-[-15px] top-[30px] h-[70px] w-2.5 rounded-md shadow-[0_0_6px_0_rgba(0,0,0,0.11)] 
                    ${isSelected
                            ? "bg-gradient-to-b from-secondary to-primary"
                            : "bg-white"}`}>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-[25px] flex items-center justify-center gap-1">
                        <div className="flex-1 w-5/6 items-center flex-wrap rounded-md bg-white p-[8px_2px] text-center shadow-[0_0_3px_0_rgba(0,0,0,0.15)] cursor-pointer hover:bg-black/5 hover:shadow-none " onClick={!isSelected ? () => { setSelectedTable(item); navigate("/pos/dashboard"); } : () => setSelectedTable({})}>
                          <div className="flex gap-1 items-center text-xs justify-center text-[#555555]" >
                            <span className="text-lg text-[#15b71a]">
                              <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
                                <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
                              </svg>
                            </span>
                            {isSelected ? "Current Table" : "Set Table"}
                          </div>
                        </div>

                        <div
                          className="w-1/6 flex justify-end items-center text-[#555555] text-lg cursor-pointer"
                          aria-label="Delete table"
                          onClick={() => handleDeleteTable(item.localId)}
                        >
                          <svg viewBox="64 64 896 896" width="20px" height="20px" fill="currentColor">
                            <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                          </svg>
                        </div>
                      </div>

                    </div>
                  </div>

                );
              })}
            </div>
          ) : (
            <div className="p-5">
              No tables found matching your search.
            </div>
          )}

        </div>
      </div>
      {addNewTableModal && (
        <AddNewTable
          onClose={handleAddNewTableCloseModal}
          onSave={handleAddTableSave}
        />
      )}
    </div>
  );
};

export default Tables;
