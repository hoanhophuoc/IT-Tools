"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar";
import PremiumRequestButton from "@/components/PremiumRequestButton";
import {
  FiLogIn,
  FiLogOut,
  FiUser,
  FiStar,
  FiMenu,
  FiHome,
  FiShield,
} from "react-icons/fi";

export default function Header({ isSidebarOpen, toggleSidebar }) {
  const { user, isAuthenticated, logout, loading, searchTerm, setSearchTerm } =
    useAuth();
  console.log("Header rendering with searchTerm:", searchTerm);

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 text-gray-300 shadow-sm md:px-6 lg:px-8">
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
      <div className="flex-1 px-4 md:mx-6 lg:mx-10">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search tools..."
        />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {!loading &&
          isAuthenticated &&
          user?.role !== "Premium" &&
          user?.role !== "Admin" && <PremiumRequestButton />}
        {!loading && (user?.role === "Premium" || user?.role === "Admin") && (
          <span className="text-yellow-500" title="Premium Member">
            <FiStar size={18} />
          </span>
        )}
        {loading ? (
          <div className="h-6 w-16 animate-pulse rounded bg-gray-700"></div>
        ) : isAuthenticated ? (
          <>
            {user?.role === "Admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded p-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                title="Admin Panel"
              >
                <FiShield size={16} />
              </Link>
            )}
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
