"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar"; // Keep your SearchBar or improve it
import PremiumRequestButton from "@/components/PremiumRequestButton";
import {
  FiLogIn,
  FiLogOut,
  FiUser,
  FiStar,
  FiSearch,
  FiMenu,
} from "react-icons/fi"; // Example icons
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  // Note: Sidebar toggle state would need to be managed globally (e.g., Context or Zustand)
  // if Header needs to control the Sidebar passed from the parent layout.
  // For simplicity here, let's assume sidebar state is handled elsewhere or not needed in Header.

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
      {/* Left side: Maybe a mobile menu toggle if needed */}
      {/* <button className="md:hidden p-2 text-gray-600 dark:text-gray-300"> <FiMenu/> </button> */}

      {/* Center: Search Bar (optional placement) */}
      <div className="flex-1 px-4 md:px-10">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Premium Request Button */}
        {!loading &&
          isAuthenticated &&
          user?.role !== "Premium" &&
          user?.role !== "Admin" && <PremiumRequestButton />}
        {/* Show Premium Star if user is premium */}
        {!loading && (user?.role === "Premium" || user?.role === "Admin") && (
          <span className="text-yellow-500" title="Premium Member">
            <FiStar size={20} />
          </span>
        )}

        {/* Auth Buttons / User Menu */}
        {loading ? (
          <div className="h-6 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div> // Skeleton loader
        ) : isAuthenticated ? (
          <>
            <Link
              href="/account"
              className="flex items-center gap-1 rounded p-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Account"
            >
              <FiUser size={18} />
              <span className="hidden sm:inline">{user?.username}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded p-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Logout"
            >
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1 rounded p-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
          >
            <FiLogIn size={18} /> Login
          </Link>
        )}
      </div>
    </header>
  );
}
