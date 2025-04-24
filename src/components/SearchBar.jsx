"use client"; // Needs client-side state for the input

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation"; // To potentially navigate to a search results page

// Accepts props:
// - placeholder (optional): Placeholder text for the input
// - onSearchSubmit (optional): Function called when search is submitted (e.g., Enter key)
// - initialValue (optional): Initial value for the search input
export default function SearchBar({
  placeholder = "Search tools...",
  onSearchSubmit,
  initialValue = "",
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const router = useRouter();

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    // You could add debouncing here if you want live filtering/suggestions
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return; // Don't submit empty search

    console.log("Search submitted:", trimmedTerm);

    // Option 1: Call the callback prop if provided
    if (onSearchSubmit) {
      onSearchSubmit(trimmedTerm);
    }
    // Option 2: Navigate to a dedicated search results page
    else {
      // Example: Navigate to /search?q=your-term
      router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
      // You would need to create a src/app/search/page.jsx to handle this route
    }

    // Optional: Clear search bar after submission?
    // setSearchTerm('');
  };

  return (
    // Use a form for better accessibility and handling Enter key submission
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <FiSearch
          className="h-5 w-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
      <input
        type="search" // Use type="search" for better semantics and potential browser UI (like a clear button)
        name="search"
        id="search"
        className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        aria-label="Search tools"
      />
      {/* You could add a hidden submit button for accessibility if needed,
           but the form's onSubmit usually handles Enter */}
      {/* <button type="submit" className="sr-only">Search</button> */}
    </form>
  );
}
