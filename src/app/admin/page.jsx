"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function AdminHomePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "Admin") {
      router.replace("/admin/tools");
    }
  }, [authLoading, isAuthenticated, user, router]);

  return (
    <div className="flex h-40 items-center justify-center">
      <Spinner size="lg" />
      <p className="ml-3 text-gray-600 dark:text-gray-400">
        Loading Admin Area...
      </p>
    </div>
  );
}
