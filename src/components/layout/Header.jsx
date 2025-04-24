// src/components/layout/Header.jsx
"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar"; // Keep SearchBar
import PremiumRequestButton from "@/components/PremiumRequestButton"; // Keep this
import {
  FiLogIn,
  FiLogOut,
  FiUser,
  FiStar,
  FiMenu,
  FiHome,
} from "react-icons/fi";

// Receive props from layout - only toggleSidebar is strictly needed now
export default function Header({ isSidebarOpen, toggleSidebar }) {
  const { user, isAuthenticated, logout, loading } = useAuth(); // Get loading state

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 text-gray-300 shadow-sm md:px-6 lg:px-8">
      {" "}
      {/* Dark Header */}
      {/* Left Side: Toggle Button + Home Icon */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <FiMenu size={20} />
        </button>
        <Link
          href="/"
          className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          title="Home"
        >
          <FiHome size={20} />
        </Link>
      </div>
      {/* Center: Search Bar */}
      <div className="flex-1 px-4 md:mx-6 lg:mx-10">
        {/* Adjust SearchBar styling for dark theme if needed */}
        <SearchBar placeholder="Search tools..." />
      </div>
      {/* Right side: Actions & User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* --- Existing Auth/Premium Buttons --- */}
        {/* Premium Request Button */}
        {!loading &&
          isAuthenticated &&
          user?.role !== "Premium" &&
          user?.role !== "Admin" && <PremiumRequestButton />}
        {/* Show Premium Star */}
        {!loading && (user?.role === "Premium" || user?.role === "Admin") && (
          <span className="text-yellow-500" title="Premium Member">
            <FiStar size={18} />
          </span>
        )}

        {/* Auth Status */}
        {loading ? (
          <div className="h-6 w-16 animate-pulse rounded bg-gray-700"></div>
        ) : isAuthenticated ? (
          <>
            {/* Account Link */}
            <Link
              href="/account"
              className="flex items-center gap-1 rounded p-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
              title="Account"
            >
              <FiUser size={16} />
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded p-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
              title="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-1 rounded p-2 text-sm font-medium text-indigo-400 hover:bg-gray-700 hover:text-white"
          >
            <FiLogIn size={16} /> Login
          </Link>
        )}
      </div>
    </header>
  );
}
