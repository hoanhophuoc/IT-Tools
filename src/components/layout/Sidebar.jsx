"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { FiChevronRight, FiChevronDown, FiTool, FiHeart } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";

export default function Sidebar({
  categories = [],
  isSidebarOpen,
  toggleSidebar,
  isLoading,
  error,
}) {
  const [visibleCategories, setVisibleCategories] = useState({});
  const { isAuthenticated, favoriteToolIds } = useAuth();
  const [showFavorites, setShowFavorites] = useState(true);
  const toggleCategory = (categoryId) => {
    if (!isSidebarOpen) return;
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };
  const favoriteToolsList = useMemo(
    () =>
      isAuthenticated
        ? categories
            .flatMap((cat) => cat.tools || [])
            .filter((tool) => favoriteToolIds.has(tool.toolId))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [isAuthenticated, categories, favoriteToolIds],
  );
  return (
    <>
      <aside
        className={`sticky top-0 z-30 h-screen flex-shrink-0 border-r border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-lg transition-all duration-300 md:sticky ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        {isSidebarOpen && (
          <div className="flex h-full flex-col">
            <div className="flex h-16 flex-shrink-0 items-center justify-start border-b border-gray-700 px-4">
              <Link href="/" className="text-xl font-bold text-white">
                IT-Tools
              </Link>
            </div>
            <nav className="flex-grow overflow-y-auto px-2 py-4">
              {isAuthenticated && favoriteToolsList.length > 0 && (
                <div className="mb-1">
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="group flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <span className="flex flex-1 items-center gap-2">
                      <FiHeart
                        size={16}
                        className="flex-shrink-0 text-pink-400"
                      />{" "}
                      Your favorite tools
                    </span>
                    {showFavorites ? (
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
                  {showFavorites && (
                    <ul className="mt-1 space-y-1 pl-8">
                      {favoriteToolsList.map((tool) => (
                        <li key={tool.toolId}>
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="flex items-center gap-2 rounded py-1 pr-2 pl-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            <Image
                              src={`/images/icons/${tool.icon}`}
                              alt=""
                              width={16}
                              height={16}
                              className="flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="flex-grow truncate text-sm text-white opacity-80">
                              {tool.name}
                            </span>
                            {tool.isPremium && (
                              <span className="ml-1 flex-shrink-0 text-xs text-yellow-500">
                                ★
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {isAuthenticated &&
                favoriteToolsList.length > 0 &&
                !isLoading &&
                !error &&
                categories.length > 0 && (
                  <hr className="my-3 border-gray-700" />
                )}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Spinner size="md" />
                </div>
              )}
              {error && !isLoading && (
                <div className="p-3 text-center text-red-400">{error}</div>
              )}
              {!isLoading && !error && categories.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No categories found.
                </div>
              )}
              {!isLoading &&
                !error &&
                (categories || []).map((category) => (
                  <div key={category.categoryId} className="mb-1">
                    <button
                      onClick={() => toggleCategory(category.categoryId)}
                      className="group flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
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
                    {visibleCategories[category.categoryId] && (
                      <ul className="mt-1 space-y-1 pl-8">
                        {(category.tools || []).map((tool) => {
                          const iconSrc = tool.icon
                            ? `/images/icons/${tool.icon}`
                            : null;
                          return (
                            <li key={tool.toolId}>
                              <Link
                                href={`/tools/${tool.slug}`}
                                className="flex items-center gap-2 rounded py-1 pr-2 pl-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                              >
                                <Image
                                  src={iconSrc}
                                  alt=""
                                  width={16}
                                  height={16}
                                  className="flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <span className="flex-grow truncate text-sm text-white opacity-80">
                                  {tool.name}
                                </span>
                                {tool.isPremium && (
                                  <span className="ml-1 flex-shrink-0 text-yellow-500">
                                    ★
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
            </nav>
          </div>
        )}
      </aside>
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
