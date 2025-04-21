import ToolCard from "@/components/ToolCard";
import { apiGetEnabledTools } from "@/lib/api";

// Server Component
export default async function Home() {
  let tools = [];
  let error = null;

  try {
    // Fetch tool data from the backend API
    // Assumes the API returns an array of tools matching ToolCard props
    // e.g., [{ toolId, name, description, componentName, icon, isPremium }]
    tools = await apiGetEnabledTools();
  } catch (err) {
    console.error("Failed to fetch tools:", err);
    error = "Could not load tools. Please try again later.";
  }

  const premiumTools = tools.filter((tool) => tool.isPremium);
  const freeTools = tools.filter((tool) => !tool.isPremium);

  return (
    <div className="space-y-8">
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Premium Tools Section */}
      {premiumTools.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            Premium Tools ✨
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {premiumTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Free/All Tools Section */}
      {freeTools.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
            Free Tools
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {freeTools.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Handle case where no tools are loaded */}
      {!error && tools.length === 0 && (
        <p className="text-center text-gray-500">
          No tools available at the moment.
        </p>
      )}
    </div>
  );
}
