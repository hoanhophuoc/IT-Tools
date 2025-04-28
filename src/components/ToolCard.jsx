// src/components/ToolCard.jsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiStar, FiTool } from "react-icons/fi";

export default function ToolCard({ tool }) {
  const [imgError, setImgError] = useState(false);

  if (!tool || !tool.slug || !tool.name) {
    // ... (invalid data handling) ...
    return (
      <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-600">
        Invalid Tool Data
      </div>
    );
  }

  const toolLink = `/tools/${tool.slug}`;
  const iconSrc = tool.icon && !imgError ? `/images/icons/${tool.icon}` : null;

  const handleImageError = () => {
    console.warn(`Failed to load icon: /images/icons/${tool.icon}`);
    setImgError(true);
  };

  return (
    <Link
      href={toolLink}
      className="group flex h-36 flex-col justify-between rounded-lg border border-transparent bg-white p-4 shadow-sm transition duration-150 ease-in-out hover:border-indigo-300 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:ring-offset-gray-900" // Darker BG, transparent border initially
    >
      {/* Top section: Icon and Premium Star */}
      <div>
        <div className="mb-3 flex items-start justify-between">
          {/* Icon Area */}
          <div className="text-gray-400 transition-colors duration-150 ease-in-out group-hover:text-indigo-500 dark:text-gray-300 dark:group-hover:text-indigo-400">
            {" "}
            {/* Icon color container */}
            {
              iconSrc ? (
                <Image
                  src={iconSrc}
                  alt="" // Alt text intentionally empty as link text serves purpose
                  width={32}
                  height={32}
                  onError={handleImageError}
                  className={imgError ? "hidden" : "block"} // Hide explicitly on error
                />
              ) : null /* Don't render Image if src is null */
            }
            {/* Render default FiTool if no icon OR if image errored */}
            {(!iconSrc || imgError) && (
              <FiTool size={32} className="flex-shrink-0" />
            )}
          </div>

          {/* Premium Star */}
          {tool.isPremium && (
            <FiStar
              size={16}
              className="flex-shrink-0 text-yellow-400 dark:text-yellow-500" // Consistent yellow
              title="Premium Tool"
            />
          )}
        </div>
        {/* Tool Name */}
        <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
          {tool.name}
        </h3>
      </div>

      {/* Bottom section: Description */}
      <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {" "}
        {/* line-clamp-2 should work well */}
        {tool.description || "No description available."}
      </p>
    </Link>
  );
}
