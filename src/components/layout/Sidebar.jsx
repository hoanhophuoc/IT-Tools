// src/components/layout/Sidebar.jsx
"use client";
import { useState } from "react"; // Removed unused useEffect from here
import Link from "next/link";
// Assuming using slugs stored in DB now
import { FiChevronRight, FiChevronDown } from "react-icons/fi"; // Removed FiChevronsLeft
import Spinner from "@/components/ui/Spinner"; // Import Spinner

// Removed Icon Mapping - Add back if you implement category-specific icons

// Receive toggleSidebar as a prop
export default function Sidebar({
  categories = [],
  isSidebarOpen,
  toggleSidebar,
  isLoading,
  error,
}) {
  const [visibleCategories, setVisibleCategories] = useState({});
  // Removed useAuth import and related logic as Account/Admin sections are removed
  // const { user, isAuthenticated } = useAuth();

  const toggleCategory = (categoryId) => {
    // If sidebar is closed, clicking the category name won't do anything
    // The user needs to click the main toggle in the header first
    if (!isSidebarOpen) return;
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <>
      {/* Sidebar Container - Reverted to Dark Styling */}
      <aside
        className={`sticky top-0 z-30 h-screen flex-shrink-0 border-r border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-lg transition-all duration-300 md:sticky ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        {/* Render content ONLY when open */}
        {isSidebarOpen && (
          <div className="flex h-full flex-col">
            {/* Header Section - Reverted Styling & Removed Button */}
            <div className="flex h-16 flex-shrink-0 items-center justify-start border-b border-gray-700 px-4">
              <Link href="/" className="text-xl font-bold text-white">
                IT-Tools
              </Link>
              {/* Removed Collapse Button */}
            </div>

            {/* Subtitle Removed */}
            {/* Gradient Separator Removed */}

            {/* Navigation Links - Reverted Styling */}
            <nav className="flex-grow overflow-y-auto px-2 py-4">
              {/* Loading State - Reverted Styling */}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Spinner size="md" />
                </div>
              )}
              {/* Error State - Reverted Styling */}
              {error && !isLoading && (
                <div className="p-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}
              {/* No Categories State - Reverted Styling */}
              {!isLoading && !error && categories.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-400">
                  No categories found.
                </div>
              )}

              {/* Categories and Tools - Reverted Styling */}
              {!isLoading &&
                !error &&
                (categories || []).map((category) => (
                  <div key={category.categoryId} className="mb-1">
                    {" "}
                    {/* Added margin-bottom */}
                    {/* Category Toggle Button - Reverted Styling */}
                    <button
                      onClick={() => toggleCategory(category.categoryId)}
                      className="group flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {/* Removed icon */}
                      <span className="flex-1">{category.name}</span>
                      {visibleCategories[category.categoryId] ? (
                        <FiChevronDown
                          size={16}
                          className="text-gray-400 opacity-60"
                        />
                      ) : (
                        <FiChevronRight
                          size={16}
                          className="text-gray-400 opacity-60"
                        />
                      )}
                    </button>
                    {/* Tool Links - Reverted Styling */}
                    {visibleCategories[category.categoryId] && (
                      <ul className="mt-1 space-y-1 pl-8">
                        {" "}
                        {/* Adjusted padding */}
                        {(category.tools || []).map((tool) => (
                          <li key={tool.toolId}>
                            <Link
                              href={`/tools/${tool.slug}`} // Use slug
                              className="block rounded py-1 pr-2 pl-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              {tool.name}
                              {/* Premium indicator removed for simplicity, add back if needed */}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {/* Separator before Account/Admin Removed */}
              {/* Account Link Removed */}
              {/* Admin Links Removed */}
            </nav>
          </div>
        )}
      </aside>

      {/* Mobile Overlay Removed */}
    </>
  );
}
