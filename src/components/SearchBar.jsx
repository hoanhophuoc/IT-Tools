"use client";

import { FiSearch } from "react-icons/fi";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = "Search tools...",
}) {
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value); // Call the function passed via props
  };

  return (
    <div className="relative w-full max-w-xl">
      {" "}
      {/* Max width and center */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <FiSearch
          className="h-5 w-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
      <input
        type="search"
        name="search"
        id="search"
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400"
        placeholder={placeholder}
        value={searchTerm || ""} // Controlled input reads directly from prop
        onChange={handleInputChange} // Calls prop function on change
        aria-label="Search tools"
      />
    </div>
  );
}
