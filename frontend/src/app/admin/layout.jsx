"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiSettings, FiUsers, FiCheckSquare } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login?redirect=/admin");
      } else if (user?.role !== "Admin") {
        router.replace("/?error=unauthorized");
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

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

  const activeTabKey = pathname.split("/")[2] || "tools";

  const linkClass = (key) =>
    `flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      activeTabKey === key
        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
    }`;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl rounded-lg bg-white p-4 shadow-lg sm:p-6 dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
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
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
