"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, notFound, useRouter } from "next/navigation";
import { apiGetToolDetails } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useAuth } from "@/hooks/useAuth";

const getComponentPath = (componentUrl) => {
  if (
    !componentUrl ||
    typeof componentUrl !== "string" ||
    !componentUrl.startsWith("tools/")
  ) {
    return null;
  }
  return `@/${componentUrl.replace(/\.jsx?$/, "")}`;
};

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [toolDetails, setToolDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [ToolComponent, setToolComponent] = useState(null);

  const toolSlug = params.toolSlug || null;

  useEffect(() => {
    if (!toolSlug) {
      setError("Tool identifier missing.");
      setLoading(false);
      return;
    }
    if (authLoading) {
      setLoading(true);
      return;
    }
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setToolComponent(null);

    const fetchAndLoadTool = async () => {
      try {
        const details = await apiGetToolDetails(toolSlug);
        if (!details || !details.componentUrl) {
          throw new Error("Tool details not found or invalid configuration.");
        }
        setToolDetails(details);

        const isPremium = details.isPremium;
        const canAccess =
          !isPremium ||
          (isAuthenticated &&
            (user?.role === "Premium" || user?.role === "Admin"));

        if (!canAccess) {
          setPermissionDenied(true);
          setError(
            isPremium
              ? "You need a Premium account to access this tool."
              : "Access Denied.",
          );
          setLoading(false);
          return;
        }

        const componentPath = getComponentPath(details.componentUrl);
        if (!componentPath) {
          throw new Error(
            `Invalid component path configured: ${details.componentUrl}`,
          );
        }

        const DynamicTool = dynamic(
          () =>
            import(componentPath).catch((err) => {
              console.error(
                `Failed to import component at ${componentPath} (URL: ${details.componentUrl}):`,
                err,
              );
              throw new Error(
                `Component module not found or failed to load at path: ${details.componentUrl}. Check server logs.`,
              );
            }),
          { suspense: true, ssr: false },
        );
        setToolComponent(() => DynamicTool);
      } catch (err) {
        console.error(`Error loading tool with slug "${toolSlug}":`, err);
        if (
          err.message &&
          (err.message.includes("404") ||
            err.message.toLowerCase().includes("not found"))
        ) {
          notFound();
        } else if (
          err.message &&
          (err.message.includes("403") ||
            err.message.toLowerCase().includes("not found"))
        ) {
          setPermissionDenied(true);
        } else {
          setError(`Failed to load tool: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndLoadTool();
  }, [toolSlug, user, isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="rounded border border-yellow-400 bg-yellow-50 p-6 text-center text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <h2 className="mb-2 text-lg font-semibold">
          Premium Tool Access Required
        </h2>
        <p className="mb-4">{error}</p>
        {!isAuthenticated && (
          <Button
            variant="primary"
            onClick={() => router.push(`/auth/login?redirect=/${toolSlug}`)}
          >
            Login to Access
          </Button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!ToolComponent || !toolDetails) {
    return (
      <div className="text-center text-gray-500">
        Could not load the tool component. Please check the configuration or
        contact support.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
        <h1 className="text-4xl font-semibold">
          {toolDetails.name}
          {toolDetails.isPremium && (
            <span className="ml-2 align-middle text-sm text-yellow-500">
              ★ Premium
            </span>
          )}
        </h1>
        <div className="ml-4 flex-shrink-0">
          {isAuthenticated && toolDetails && (
            <FavoriteButton toolId={toolDetails.toolId} size={24} />
          )}
        </div>
      </div>

      {toolDetails.description && (
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {toolDetails.description}
        </p>
      )}
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <ToolComponent />
      </Suspense>
    </div>
  );
}
