import React from "react";
import { useNavigate } from "react-router-dom";
import { useRetail } from "../../hooks/useRetail";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  resultCount = 0,
  dateRange,
  givenDate,
  setDateRange,
  setGivenDate,
  activegivenDate = false,
  activeDateRange = false,
}) => {
  const navigate = useNavigate();
  const { setIsRetail, setIsRetailOpen } = useRetail();
  return (
    <div className="search relative mt-4 flex items-center justify-between gap-2">
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="py-2 pl-8 bg-white rounded-md w-4/5 shadow-[0_0_3px_#00000026] outline-0 cursor-text placeholder:text-[#555555] placeholder:text-sm"
      />
      {activeDateRange &&
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="p-2.5 rounded-md text-sm outline-none shadow-[0_0_3px_#00000026] bg-white "
            value={dateRange.start || ""}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="p-2.5 rounded-md text-sm outline-none shadow-[0_0_3px_#00000026] bg-white "
            value={dateRange.end || ""}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      }

      <div className="cart-icons p-2 shadow-[0_0_3px_#00000026] text-[#555555] rounded-md cursor-pointer bg-white" onClick={() => { setIsRetail(true); setIsRetailOpen(true); navigate("/pos/dashboard"); }}>
        <svg
          viewBox="0 0 1024 1024"
          focusable="false"
          data-icon="shopping-cart"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M120 160H72c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zm833 0h-48c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8zM200 736h112c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm321 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm126 0h178c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8H647c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-255 0h48c4.4 0 8-3.6 8-8V168c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v560c0 4.4 3.6 8 8 8zm-79 64H201c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm257 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm256 0H648c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h178c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm-385 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z"></path>
        </svg>
      </div>
      <div>
        {/* {activegivenDate &&
          <input
            type="date"
            className="p-2.5 rounded-md text-sm outline-none shadow-[0_0_3px_#00000026] bg-white "
            // HTML date inputs expect YYYY-MM-DD format
            value={givenDate.toISOString().split('T')[0]}
            onChange={(e) => {
              if (!e.target.value) return; // Ignore if user clears the input
              setGivenDate(new Date(e.target.value));
            }}
          />
        } */}


      </div>

      <span className="text-sm text-[#555555] px-2 min-w-25 text-right">
        <p>{resultCount} Results</p>
      </span>
    </div>
  );
};

export default SearchBar;
