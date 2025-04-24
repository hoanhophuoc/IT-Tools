// src/components/layout/Sidebar.jsx
"use client";
import { useState } from "react"; // Removed unused useEffect
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
// Assuming using slugs stored in DB now
import {
  FiChevronRight,
  FiChevronDown,
  FiSettings,
  FiUsers,
  FiCheckSquare,
  FiUser, // Removed FiGrid, FiHome, FiChevronsLeft
} from "react-icons/fi";
// Removed category icon imports/logic
import Spinner from "@/components/ui/Spinner"; // Import Spinner

// Receive toggleSidebar prop, primarily for the mobile overlay to use
export default function Sidebar({
  categories = [],
  isSidebarOpen,
  toggleSidebar,
  isLoading,
  error,
}) {
  const [visibleCategories, setVisibleCategories] = useState({});
  const { user, isAuthenticated } = useAuth();

  const toggleCategory = (categoryId) => {
    // Only allow toggling categories if the sidebar is actually open
    if (!isSidebarOpen) return;
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Auto-collapse logic (Optional - keep if desired for responsiveness)
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 768) { setIsSidebarOpen(false); } // md breakpoint
  //   };
  //   handleResize();
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []); // Run only once on initial mount if only auto-collapsing

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`sticky top-0 z-30 h-screen flex-shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-lg transition-all duration-300 md:sticky ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden" // w-0 hides it, overflow-hidden prevents content flash
        }`}
      >
        {/* Render content ONLY when open */}
        {isSidebarOpen && (
          <div className="flex h-full flex-col">
            {/* Header Section: Logo and Title Only */}
            <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-700 px-4">
              <Link href="/" className="text-xl font-bold text-white">
                IT-Tools
              </Link>
              {/* Internal Collapse Button Removed */}
            </div>

            {/* Subtitle */}
            <div className="px-4 py-2 text-xs text-gray-400">
              Handy tools for developers
            </div>
            {/* Separator */}
            <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500 opacity-80 shadow-inner"></div>

            {/* Navigation Links - Scrollable Area */}
            <nav className="flex-grow space-y-1 overflow-y-auto px-2 py-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Spinner size="md" />
                  <span className="ml-2 text-sm text-gray-400">
                    Loading Tools...
                  </span>
                </div>
              )}
              {/* Error State */}
              {error && !isLoading && (
                <div className="mx-2 rounded-md border border-red-600/50 bg-red-900/30 p-3 text-center text-sm text-red-300">
                  Could not load tools. <br /> Please check connection or try
                  again later.
                  {/* <span className="block text-xs mt-1 opacity-70">{error}</span> */}
                </div>
              )}
              {/* No Categories State */}
              {!isLoading && !error && categories.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-400">
                  No tools or categories found.
                </div>
              )}

              {/* Categories and Tools List */}
              {!isLoading &&
                !error &&
                categories.length > 0 &&
                (categories || []).map((category) => (
                  <div key={category.categoryId}>
                    {/* Category Toggle Button (No Icon) */}
                    <button
                      onClick={() => toggleCategory(category.categoryId)}
                      className="group flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      disabled={!isSidebarOpen} // Disable button interaction when sidebar is closed conceptually
                    >
                      <span className="flex-1">{category.name}</span>{" "}
                      {/* Name takes full width */}
                      {/* Arrow indicator */}
                      {visibleCategories[category.categoryId] ? (
                        <FiChevronDown size={16} className="opacity-60" />
                      ) : (
                        <FiChevronRight size={16} className="opacity-60" />
                      )}
                    </button>
                    {/* Tool Links */}
                    {visibleCategories[category.categoryId] && (
                      <ul className="mt-1 space-y-1 pl-8">
                        {" "}
                        {/* Indent tool links */}
                        {(category.tools || []).map((tool) => (
                          <li key={tool.toolId}>
                            <Link
                              href={`/tools/${tool.slug}`} // Use slug from DB
                              className="block rounded py-1 pr-2 pl-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              {tool.name}
                              {tool.isPremium && (
                                <span className="ml-1 text-xs text-yellow-500">
                                  ★
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                        {/* Message if category has no tools */}
                        {(category.tools || []).length === 0 && (
                          <li className="py-1 pr-2 pl-1 text-xs text-gray-500 italic">
                            No tools in this category
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}

              {/* Render Account/Admin links only if categories loaded successfully */}
              {!isLoading && !error && (
                <>
                  {/* Separator only needed if Auth/Admin links are shown below categories */}
                  {(isAuthenticated || user?.role === "Admin") &&
                    categories.length > 0 && (
                      <hr className="my-3 border-gray-700" />
                    )}

                  {/* Account Link */}
                  {isAuthenticated && (
                    <Link
                      href="/account"
                      className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <FiUser size={18} className="flex-shrink-0" />
                      <span className="flex-1">Account</span>
                    </Link>
                  )}

                  {/* Admin Links */}
                  {user?.role === "Admin" && (
                    <>
                      {isAuthenticated && (
                        <hr className="my-3 border-gray-700" />
                      )}{" "}
                      {/* Separator if account is also shown */}
                      <div className="mt-2 space-y-1">
                        <span className="px-2 text-xs font-semibold text-gray-500 uppercase">
                          Admin
                        </span>
                        <Link
                          href="/admin/tools"
                          className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <FiSettings size={18} className="flex-shrink-0" />{" "}
                          Tools
                        </Link>
                        <Link
                          href="/admin/users"
                          className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <FiUsers size={18} className="flex-shrink-0" /> Users
                        </Link>
                        <Link
                          href="/admin/upgrade-requests"
                          className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <FiCheckSquare size={18} className="flex-shrink-0" />{" "}
                          Requests
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Footer Section Removed */}
          </div>
        )}
      </aside>

      {/* Mobile Overlay - Uses toggleSidebar from props */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black opacity-30 md:hidden"
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}
