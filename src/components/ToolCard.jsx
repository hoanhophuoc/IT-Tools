// src/components/ToolCard.jsx
import Link from "next/link";
import Image from "next/image";
import { FiStar, FiTool } from "react-icons/fi";

export default function ToolCard({ tool }) {
  // *** CHANGE HERE: Direct link using slugified name ***
  const toolLink = `/${slugify(tool.name)}`;

  return (
    <Link
      href={toolLink}
      className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          {tool.icon ? (
            <Image
              src={`/images/icons/${tool.icon}`}
              alt={`${tool.name} icon`}
              width={32}
              height={32}
              onError={(e) =>
                (e.currentTarget.style.display = "none")
              } /* Hide if icon fails */
            />
          ) : (
            <FiTool size={32} className="text-indigo-500" />
          )}
          {tool.isPremium && (
            <FiStar
              size={16}
              className="text-yellow-500"
              title="Premium Tool"
            />
          )}
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-gray-200 dark:group-hover:text-indigo-400">
          {tool.name}
        </h3>
      </div>
      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
        {tool.description || "No description available."}
      </p>
    </Link>
  );
}
