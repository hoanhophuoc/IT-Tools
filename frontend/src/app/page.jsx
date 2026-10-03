"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import { apiGetCategorizedTools } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function RootHomePage() {
  const [categorizedTools, setCategorizedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    isAuthenticated,
    favoriteToolIds,
    loading: authLoading,
    searchTerm,
  } = useAuth();
  console.log("Home Page rendering with searchTerm:", searchTerm);

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
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const allTools = useMemo(
    () => categorizedTools.flatMap((category) => category.tools || []),
    [categorizedTools],
  );

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      return allTools;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerCaseSearch) ||
        (tool.description &&
          tool.description.toLowerCase().includes(lowerCaseSearch)),
    );
  }, [allTools, searchTerm]);

  const favoriteToolsList = useMemo(
    () =>
      isAuthenticated
        ? filteredTools
            .filter((tool) => favoriteToolIds.has(tool.toolId))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [isAuthenticated, filteredTools, favoriteToolIds],
  );

  const nonFavoriteTools = useMemo(
    () => filteredTools.filter((tool) => !favoriteToolIds.has(tool.toolId)),
    [filteredTools, favoriteToolIds],
  );
  const premiumTools = nonFavoriteTools.filter((tool) => tool.isPremium);
  const freeTools = nonFavoriteTools.filter((tool) => !tool.isPremium);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const noResultsFound = !error && searchTerm && filteredTools.length === 0;
  const noToolsAvailable = !error && !searchTerm && allTools.length === 0;

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-md bg-red-100 p-3 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      {noResultsFound && (
        <p className="...">No tools found matching "{searchTerm}".</p>
      )}
      {isAuthenticated && favoriteToolsList.length > 0 && !noResultsFound && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            Your favorite tools ❤️
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteToolsList.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}
      {(premiumTools.length > 0 || freeTools.length > 0) && !noResultsFound && (
        <section>
          {isAuthenticated && favoriteToolsList.length > 0 && (
            <hr className="my-8 border-gray-300 dark:border-gray-600" />
          )}

          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            All the tools
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {premiumTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
            {freeTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}
      {!error && noToolsAvailable && allTools.length === 0 && !loading && (
        <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
          No tools available at the moment. Check back later!
        </p>
      )}
    </div>
  );
}
