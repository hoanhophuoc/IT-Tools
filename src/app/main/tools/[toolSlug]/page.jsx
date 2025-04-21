// src/app/(main)/[toolSlug]/page.jsx <-- Renamed file
"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, notFound } from "next/navigation";
import { apiGetToolDetails } from "@/lib/api";
import { Spinner } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const getComponentPath = (componentUrl) => {
  if (
    !componentUrl ||
    typeof componentUrl !== "string" ||
    !componentUrl.startsWith("tools/")
  ) {
    console.error("Invalid component_url format received:", componentUrl);
    return null;
  }
  return `@/${componentUrl.replace(/\.jsx?$/, "")}`;
};

export default function ToolPage() {
  const params = useParams();
  const { user } = useAuth();
  const [toolDetails, setToolDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ToolComponent, setToolComponent] = useState(null);

  // *** Extract and decode the tool name from the URL slug ***
  const encodedToolName = params.slug?.[0] || null;
  const toolName = encodedToolName ? decodeURIComponent(encodedToolName) : null;

  useEffect(() => {
    // *** Check decoded toolName ***
    if (!toolName) {
      setError("Tool identifier missing or invalid.");
      setLoading(false);
      return;
    }

    const fetchAndLoadTool = async () => {
      setLoading(true);
      setError(null);
      setToolComponent(null);

      try {
        // 1. Fetch details using the decoded tool name
        // *** Pass decoded toolName to API call ***
        const details = await apiGetToolDetails(toolName);

        // Basic check if details were found
        if (!details || !details.component_url) {
          console.error(
            "API did not return valid tool details or component_url for:",
            toolName,
          );
          throw new Error("Tool details not found or missing component URL."); // Treat as not found
        }

        setToolDetails(details);

        // 2. Check Permissions
        if (
          details.isPremium &&
          user?.role !== "Premium" &&
          user?.role !== "Admin"
        ) {
          setError("You need a Premium account to access this tool.");
          setLoading(false);
          return;
        }

        // 3. Construct import path using component_url (from details)
        const componentPath = getComponentPath(details.component_url);
        if (!componentPath) {
          // Error already logged in helper function
          setError(
            `Invalid component path configured: ${details.component_url}`,
          );
          setLoading(false);
          return;
        }

        // 4. Dynamically import
        const DynamicTool = dynamic(
          () =>
            import(componentPath).catch((err) => {
              console.error(
                `Failed to import component at ${componentPath} (URL: ${details.component_url}):`,
                err,
              );
              throw new Error(
                `Component module not found or failed to load at path: ${details.component_url}. Check server logs.`,
              );
            }),
          {
            suspense: true,
            ssr: false,
          },
        );

        setToolComponent(() => DynamicTool);
      } catch (err) {
        console.error(`Error loading tool "${toolName}":`, err);
        if (
          err.message &&
          (err.message.includes("404") ||
            err.message.toLowerCase().includes("not found"))
        ) {
          notFound(); // Trigger Next.js 404 page
        } else {
          setError(`Failed to load tool: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndLoadTool();
    // *** Depend on the decoded toolName ***
  }, [toolName, user]); // Re-run if toolName or user role changes

  // --- Rendering Logic (remains the same) ---
  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (!ToolComponent || !toolDetails) {
    // This might happen if the import fails after loading state is false
    // or if API returns success but missing data unexpectedly
    return (
      <div className="text-center text-gray-500">
        Could not load the tool component. Please check the configuration or
        contact support.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h1 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-semibold dark:border-gray-700">
        {toolDetails.name}
        {toolDetails.isPremium && (
          <span className="ml-2 align-middle text-sm text-yellow-500">
            ★ Premium
          </span>
        )}
      </h1>
      {toolDetails.description && (
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
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
        <ToolComponent /> {/* Render the actual tool */}
      </Suspense>
    </div>
  );
}
