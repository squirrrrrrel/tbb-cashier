import React from "react";

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
      <div>
        {activegivenDate &&
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
        }

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
      </div>

      <span className="text-sm text-[#555555] px-2 min-w-25 text-right">
        <p>{resultCount} Results</p>
      </span>
    </div>
  );
};

export default SearchBar;
