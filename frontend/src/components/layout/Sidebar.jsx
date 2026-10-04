"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { FiChevronRight, FiChevronDown, FiHeart } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";

const DEFAULT_CATEGORIES = [];

function filterFavoriteTools(categories, favoriteToolIds) {
  return categories
    .flatMap((cat) => cat.tools || [])
    .filter((tool) => favoriteToolIds.has(tool.toolId))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function SidebarToolItem({ tool }) {
  const iconSrc = tool.icon ? `/images/icons/${tool.icon}` : null;
  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        className="flex items-center gap-2 rounded py-1 pr-2 pl-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
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
          <span className="ml-1 flex-shrink-0 text-xs text-yellow-500">
            ★
          </span>
        )}
      </Link>
    </li>
  );
}

function SidebarFavoritesSection({ favoriteTools, isOpen, onToggle }) {
  if (favoriteTools.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <span className="flex flex-1 items-center gap-2">
          <FiHeart size={16} className="flex-shrink-0 text-pink-400" />
          Your favorite tools
        </span>
        {isOpen ? (
          <FiChevronDown size={16} className="text-gray-400 opacity-60" />
        ) : (
          <FiChevronRight size={16} className="text-gray-400 opacity-60" />
        )}
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-8">
          {favoriteTools.map((tool) => (
            <SidebarToolItem key={tool.toolId} tool={tool} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarCategoryItem({ category, isOpen, onToggle }) {
  const tools = category.tools || [];
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <span className="flex-1">{category.name}</span>
        {isOpen ? (
          <FiChevronDown size={16} className="text-gray-400 opacity-60" />
        ) : (
          <FiChevronRight size={16} className="text-gray-400 opacity-60" />
        )}
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-8">
          {tools.map((tool) => (
            <SidebarToolItem key={tool.toolId} tool={tool} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarCategoryList({
  isLoading,
  error,
  categories,
  visibleCategories,
  onToggleCategory,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner size="md" />
      </div>
    );
  }
  if (error) {
    return <div className="p-3 text-center text-red-400">{error}</div>;
  }
  if (categories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">No categories found.</div>
    );
  }
  return categories.map((category) => (
    <SidebarCategoryItem
      key={category.categoryId}
      category={category}
      isOpen={Boolean(visibleCategories[category.categoryId])}
      onToggle={() => onToggleCategory(category.categoryId)}
    />
  ));
}

export default function Sidebar({
  categories = DEFAULT_CATEGORIES,
  isSidebarOpen,
  toggleSidebar,
  isLoading,
  error,
}) {
  const [visibleCategories, setVisibleCategories] = useState({});
  const { isAuthenticated, favoriteToolIds } = useAuth();
  const [showFavorites, setShowFavorites] = useState(true);

  const toggleCategory = (categoryId) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const favoriteToolsList = useMemo(
    () =>
      isAuthenticated ? filterFavoriteTools(categories, favoriteToolIds) : [],
    [isAuthenticated, categories, favoriteToolIds],
  );

  const hasFavorites = isAuthenticated && favoriteToolsList.length > 0;
  const showDivider =
    hasFavorites && !isLoading && !error && categories.length > 0;

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
              <SidebarFavoritesSection
                favoriteTools={favoriteToolsList}
                isOpen={showFavorites}
                onToggle={() => setShowFavorites(!showFavorites)}
              />
              {showDivider && <hr className="my-3 border-gray-700" />}
              <SidebarCategoryList
                isLoading={isLoading}
                error={error}
                categories={categories}
                visibleCategories={visibleCategories}
                onToggleCategory={toggleCategory}
              />
            </nav>
          </div>
        )}
      </aside>
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black opacity-30 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
