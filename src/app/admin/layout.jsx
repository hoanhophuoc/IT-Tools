"use client"; // Needs client for pathname and interactive links
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // To protect the whole section
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiSettings, FiUsers, FiCheckSquare } from "react-icons/fi"; // Icons for tabs
import Spinner from "@/components/ui/Spinner"; // Loading spinner

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Protection ---
  // Redirect if not authenticated or not an Admin after loading
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login?redirect=/admin"); // Redirect to login if not authenticated
      } else if (user?.role !== "Admin") {
        router.replace("/?error=unauthorized"); // Redirect to home if not Admin
        // Or show a dedicated "Forbidden" page: router.replace('/forbidden');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // --- Loading/Unauthorized State ---
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // This check prevents rendering the layout before redirection logic completes
  // or if the user is definitely not an Admin.
  if (!isAuthenticated || user?.role !== "Admin") {
    // Render minimal content or null while redirecting
    return null;
    // Or a simple message:
    // return <div className="p-4 text-center">Access Denied. Redirecting...</div>;
  }

  // --- Tab Navigation ---
  const tabs = [
    { key: "tools", label: "Tools", href: "/admin/tools", icon: FiSettings },
    { key: "users", label: "Users", href: "/admin/users", icon: FiUsers },
    {
      key: "upgrade-requests",
      label: "Upgrade Requests",
      href: "/admin/upgrade-requests",
      icon: FiCheckSquare,
    },
  ];

  // Determine active tab based on the current path segment after /admin/
  const activeTabKey = pathname.split("/")[2] || "tools"; // Default to 'tools' if path is just /admin

  // Helper function for link classes
  const linkClass = (key) =>
    `flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      activeTabKey === key
        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" // Active style
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300" // Inactive style
    }`;

  // --- Render Layout ---
  return (
    // Apply admin-specific background or padding if needed
    <div className="p-4 md:p-6 lg:p-8">
      {/* Use clamp for responsive width container */}
      <div className="mx-auto w-full max-w-6xl rounded-lg bg-white p-4 shadow-lg sm:p-6 dark:bg-gray-800">
        {/* Admin Title */}
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Panel
        </h1>

        {/* Tab Navigation */}
        <nav
          className="-mb-px flex space-x-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <Link key={tab.key} href={tab.href} className={linkClass(tab.key)}>
              <tab.icon size={16} aria-hidden="true" />
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Page Content Area */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
