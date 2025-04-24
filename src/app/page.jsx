// src/app/page.jsx
import ToolCard from "@/components/ToolCard";
import { apiGetCategorizedTools } from "@/lib/api";

export default async function RootHomePage() {
  let categorizedTools = [];
  let error = null;
  console.log(">>> [Server] Rendering Root Home Page (app/page.jsx)...");
  try {
    console.log(">>> [Server] Root Home Page fetching categorized tools...");
    categorizedTools = await apiGetCategorizedTools();
    if (!Array.isArray(categorizedTools)) {
      console.warn("API did not return an array for tools in Root Home Page.");
      categorizedTools = [];
    }
    console.log(
      `>>> [Server] Root Home Page fetched ${categorizedTools.length} categories.`,
    );
  } catch (err) {
    console.error(">>> [Server] ERROR fetching tools for root page:", err);
    error = `Could not load tools: ${err.message || "Unknown error"}`;
    categorizedTools = [];
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-md bg-red-100 p-3 text-center text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Display tools grouped by category */}
      {!error &&
        categorizedTools.length > 0 &&
        categorizedTools.map(
          (category) =>
            // Render section only if category has tools
            category.tools &&
            category.tools.length > 0 && (
              <section key={category.categoryId}>
                <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.toolId} tool={tool} />
                  ))}
                </div>
              </section>
            ),
        )}

      {/* Handle case where no tools are loaded */}
      {!error &&
        categorizedTools.flatMap((cat) => cat.tools || []).length === 0 && (
          <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
            No tools available at the moment. Check back later!
          </p>
        )}
    </div>
  );
}
