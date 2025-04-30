// src/components/ToolCard.jsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiStar } from "react-icons/fi";
import FavoriteButton from "@/components/ui/FavoriteButton"; // Use FavoriteButton

export default function ToolCard({ tool }) {
  const [imgError, setImgError] = useState(false);

  if (!tool || !tool.slug || !tool.name) {
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
      className="group relative flex h-40 flex-col justify-between rounded-lg border border-transparent bg-white p-4 shadow-sm transition duration-150 ease-in-out hover:border-indigo-300 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:ring-offset-gray-900"
    >
      {/* Top section: Icon */}
      <div className="flex items-start justify-between">
        {/* Icon Area */}
        <div className="text-gray-400 transition-colors duration-150 ease-in-out group-hover:text-indigo-500 dark:text-gray-300 dark:group-hover:text-indigo-400">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={32}
              height={32}
              onError={handleImageError}
              className={imgError ? "hidden" : "block"}
            />
          ) : null}
        </div>
        {/* Favorite Button - Moved to top right */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton toolId={tool.toolId} size={18} />
        </div>
      </div>

      {/* Bottom section: Name, Premium Star, Description */}
      <div className="flex flex-col">
        {/* Tool Name and Premium Star */}
        <div className="mb-1 flex items-center gap-1.5">
          {/* Container for name and star */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
            {tool.name}
          </h3>
          {/* Premium Star - Rendered next to the name */}
          {tool.isPremium && (
            <FiStar
              size={14} // Slightly smaller star next to text
              className="flex-shrink-0 text-yellow-400 dark:text-yellow-500"
              title="Premium Tool"
            />
          )}
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {tool.description || "No description available."}
        </p>
      </div>
    </Link>
  );
}
