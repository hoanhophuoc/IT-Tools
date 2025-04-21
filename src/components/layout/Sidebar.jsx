// src/components/layout/Sidebar.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { slugify } from "@/lib/utils"; // Import slugify
import {
  FiChevronRight,
  FiChevronDown,
  FiGrid,
  FiSettings,
  FiUsers,
  FiCheckSquare,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

export default function Sidebar({ categories = [] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState({});
  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCategory = (categoryId) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`sticky top-0 z-30 h-screen flex-shrink-0 bg-white shadow-lg transition-all duration-300 dark:bg-gray-800 ${isSidebarOpen ? "w-64" : "w-0"}`}
      >
        {isSidebarOpen && (
          <div className="flex h-full flex-col overflow-y-auto p-4">
            {/* Logo/Title */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                {" "}
                IT-Tools{" "}
              </Link>
              <button
                onClick={toggleSidebar}
                className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Collapse sidebar"
              >
                {" "}
                <FiChevronsLeft size={20} />{" "}
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow space-y-2">
              {(categories || []).map((category) => (
                <div key={category.categoryId}>
                  {/* Category Toggle Button (remains the same) */}
                  <button
                    onClick={() => toggleCategory(category.categoryId)}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      {" "}
                      <FiGrid size={16} /> {category.name}{" "}
                    </span>
                    {visibleCategories[category.categoryId] ? (
                      <FiChevronDown size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    )}
                  </button>
                  {/* Tool Links */}
                  {visibleCategories[category.categoryId] && (
                    <ul className="mt-1 space-y-1 pl-6">
                      {(category.tools || []).map((tool) => (
                        <li key={tool.toolId}>
                          {/* *** CHANGE HERE: Link using tool.name (encoded) *** */}
                          <Link
                            href={`/${slugify(tool.name)}`} // Point directly to /{slugified-name}
                            className="block rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            {tool.name}{" "}
                            {tool.isPremium && (
                              <span className="text-xs text-yellow-500">
                                {" "}
                                ★
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Admin Links */}
              {user?.role === "Admin" && (
                <>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="space-y-1">
                    <span className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                      Admin
                    </span>
                    <Link
                      href="/admin/tools"
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FiSettings size={16} /> Tools
                    </Link>
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FiUsers size={16} /> Users
                    </Link>
                    <Link
                      href="/admin/upgrade-requests"
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FiCheckSquare size={16} /> Upgrade Requests
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </aside>
      {/* Expand Button outside when closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-2 z-40 rounded-full bg-indigo-600 p-2 text-white shadow-lg hover:bg-indigo-700 sm:sticky sm:top-4 sm:bottom-auto"
          aria-label="Expand sidebar"
        >
          <FiChevronsRight size={20} />
        </button>
      )}
    </>
  );
}
