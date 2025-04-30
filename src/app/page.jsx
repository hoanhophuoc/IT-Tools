// src/app/page.jsx
"use client"; // <-- Page needs to be client component to use hooks (useAuth, useState, etc.)
import { useState, useEffect, useCallback, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import { apiGetCategorizedTools } from "@/lib/api"; // API call for initial load
import { useAuth } from "@/hooks/useAuth"; // Hook for auth state and favorite actions
import Spinner from "@/components/ui/Spinner"; // Assuming Spinner is exported here or from ui/Spinner

export default function RootHomePage() {
  // State for fetched data, loading, and errors
  const [categorizedTools, setCategorizedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get authentication state, favorite IDs, actions, and loading states from context
  const {
    isAuthenticated,
    favoriteToolIds,
    loading: authLoading,
    searchTerm,
  } = useAuth();
  console.log("Home Page rendering with searchTerm:", searchTerm);

  // Fetch initial tool/category data when component mounts
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetCategorizedTools();
      setCategorizedTools(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categorized tools:", err);
      setError(`Could not load tools: ${err.message || "Unknown error"}`);
      setCategorizedTools([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - fetch only once initially

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Derive lists based on fetched data and context state using useMemo for optimization ---

  // Memoize the flattened list of all tools
  const allTools = useMemo(
    () => categorizedTools.flatMap((category) => category.tools || []),
    [categorizedTools],
  );

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      // Use searchTerm from context
      return allTools;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerCaseSearch) ||
        (tool.description &&
          tool.description.toLowerCase().includes(lowerCaseSearch)),
    );
  }, [allTools, searchTerm]); // Depend on searchTerm from context

  // Memoize the list of favorite tools
  const favoriteToolsList = useMemo(
    () =>
      isAuthenticated
        ? filteredTools
            .filter((tool) => favoriteToolIds.has(tool.toolId))
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort favorites alphabetically
        : [],
    [isAuthenticated, filteredTools, favoriteToolIds],
  ); // Recompute when these change

  const nonFavoriteTools = useMemo(
    () => filteredTools.filter((tool) => !favoriteToolIds.has(tool.toolId)),
    [filteredTools, favoriteToolIds],
  );
  const premiumTools = nonFavoriteTools.filter((tool) => tool.isPremium);
  const freeTools = nonFavoriteTools.filter((tool) => !tool.isPremium);

  // --- Render Logic ---

  // Show main loading spinner if initial auth check OR initial tool data is loading
  if (loading || authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        {" "}
        {/* Added min-height */}
        <Spinner size="lg" />
      </div>
    );
  }

  const noResultsFound = !error && searchTerm && filteredTools.length === 0;
  const noToolsAvailable = !error && !searchTerm && allTools.length === 0;

  return (
    <div className="space-y-10">
      {" "}
      {/* Increased spacing between sections */}
      {/* Global Error Display */}
      {error && (
        <p className="rounded-md bg-red-100 p-3 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      {noResultsFound && (
        <p className="...">No tools found matching "{searchTerm}".</p>
      )}
      {/* --- Your favorite tools Section --- */}
      {isAuthenticated && favoriteToolsList.length > 0 && !noResultsFound && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            Your favorite tools {searchTerm && "(matching search)"} ❤️
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteToolsList.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}
      {/* --- End Favorites --- */}
      {/* --- All the tools Section (Non-Favorites) --- */}
      {(premiumTools.length > 0 || freeTools.length > 0) && !noResultsFound && (
        <section>
          {/* Add separator if favorites were shown */}
          {isAuthenticated && favoriteToolsList.length > 0 && (
            <hr className="my-8 border-gray-300 dark:border-gray-600" />
          )}

          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            {searchTerm ? "Matching tools" : "All the tools"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Render non-favorite tools */}
            {premiumTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
            {freeTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}
      {/* --- End All Tools --- */}
      {/* No tools available message */}
      {!error &&
        noToolsAvailable &&
        allTools.length === 0 &&
        !loading && ( // Also check loading state
          <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
            No tools available at the moment. Check back later!
          </p>
        )}
    </div>
  );
}
