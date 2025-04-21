import { apiGetCategories } from "@/lib/api"; // Fetch categories server-side
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

// This layout is a Server Component by default
export default async function MainLayout({ children }) {
  let categories = [];
  try {
    // Fetch categories needed for the sidebar
    // The backend needs an endpoint like /api/categories that returns { categoryId, name, slug, tools: [{ toolId, name, component_url, isPremium }] }
    categories = await apiGetCategories();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Handle error appropriately, maybe show a default sidebar or message
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar needs category data */}
      <Sidebar categories={categories} />

      {/* Main content area takes remaining width */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          {/* Add a container to center content or manage width */}
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
