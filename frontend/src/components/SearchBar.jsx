"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiSearch, FiX, FiTool, FiStar, FiArrowRight } from "react-icons/fi";
import { apiGetCategorizedTools } from "@/lib/api";

const DEFAULT_CATEGORIES = [];

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = "Search tools...",
  categories = DEFAULT_CATEGORIES,
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [fetchedTools, setFetchedTools] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Derive tools directly from categories prop when available
  const propTools = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return null;
    return categories.flatMap((cat) =>
      (cat.tools || []).map((t) => ({
        ...t,
        categoryName: cat.name,
      })),
    );
  }, [categories]);

  // Fallback to API fetch only when categories prop is not provided or empty
  useEffect(() => {
    if (propTools) return;
    let cancelled = false;
    apiGetCategorizedTools()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          const flattened = data.flatMap((cat) =>
            (cat.tools || []).map((t) => ({
              ...t,
              categoryName: cat.name,
            })),
          );
          setFetchedTools(flattened);
        }
      })
      .catch((err) => console.error("Failed to fetch tools for search:", err));

    return () => {
      cancelled = true;
    };
  }, [propTools]);

  const toolsList = propTools || fetchedTools;

  // Compute suggestions based on query
  const suggestions = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return [];

    return toolsList
      .filter((tool) => {
        const nameMatch = tool.name?.toLowerCase().includes(q);
        const descMatch = tool.description?.toLowerCase().includes(q);
        const catMatch = tool.categoryName?.toLowerCase().includes(q);
        const slugMatch = tool.slug?.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch || slugMatch;
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 8); // Top 8 suggestions
  }, [toolsList, searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTool = (slug) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/tools/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && searchTerm?.trim()) {
        if (suggestions.length > 0) {
          handleSelectTool(suggestions[0].slug);
        } else {
          router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectTool(suggestions[selectedIndex].slug);
      } else if (suggestions.length > 0) {
        handleSelectTool(suggestions[0].slug);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <FiSearch
          className="h-5 w-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        name="search"
        id="search"
        autoComplete="off"
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-9 pl-10 text-sm placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400"
        placeholder={placeholder}
        value={searchTerm || ""}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => {
          if (searchTerm?.trim()) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-label="Search tools"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          title="Clear search"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && searchTerm?.trim() && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/95">
          {suggestions.length > 0 ? (
            <>
              <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700/50">
                {suggestions.map((tool, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={tool.toolId || tool.slug}
                      type="button"
                      onClick={() => handleSelectTool(tool.slug)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                        isSelected
                          ? "bg-indigo-50/80 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                          : "text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/60"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                          {tool.icon ? (
                            <Image
                              src={`/images/icons/${tool.icon}`}
                              alt={tool.name}
                              width={22}
                              height={22}
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <FiTool className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {tool.name}
                            </span>
                            {tool.isPremium && (
                              <span className="flex items-center gap-0.5 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300">
                                <FiStar size={10} /> Premium
                              </span>
                            )}
                          </div>
                          {tool.description && (
                            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                              {tool.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {tool.categoryName && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {tool.categoryName}
                          </span>
                        )}
                        <FiArrowRight
                          size={14}
                          className={`transition-transform duration-150 ${
                            isSelected
                              ? "translate-x-0.5 text-indigo-600 dark:text-indigo-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-500 dark:border-gray-700/60 dark:bg-gray-800/80 dark:text-gray-400">
                <span>
                  Showing {suggestions.length} suggestion
                  {suggestions.length > 1 ? "s" : ""}
                </span>
                <span className="hidden sm:inline">
                  Use{" "}
                  <kbd className="rounded border bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                    ↑
                  </kbd>{" "}
                  <kbd className="rounded border bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                    ↓
                  </kbd>{" "}
                  to navigate,{" "}
                  <kbd className="rounded border bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                    Enter
                  </kbd>{" "}
                  to select
                </span>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>No tools found matching &quot;{searchTerm}&quot;</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Try searching for uuid, base64, jwt, hash, json, converter...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
