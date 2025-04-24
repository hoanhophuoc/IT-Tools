"use client"; // Required for using hooks like useEffect and useRouter

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Optional: for better loading/auth check
import Spinner from "@/components/ui/Spinner";

export default function AdminRootPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    // Only redirect after confirming auth state and role
    if (!authLoading && isAuthenticated && user?.role === "Admin") {
      router.replace("/admin/tools"); // Redirect to the default admin section
    }
    // If not authenticated or not admin, the layout's redirect will handle it.
  }, [authLoading, isAuthenticated, user, router]);

  // Show loading indicator while auth check/redirect happens
  return (
    <div className="flex h-40 items-center justify-center">
      <Spinner size="lg" />
      <p className="ml-3 text-gray-600 dark:text-gray-400">
        Loading Admin Area...
      </p>
    </div>
  );
}
