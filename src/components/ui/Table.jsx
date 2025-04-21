"use client"; // Assume actions might need client-side logic
import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // Example icons
import { LiaStarSolid } from "react-icons/lia"; // For premium status

// data: array of objects
// columns: array of { key: string, label: string, render?: (row) => ReactNode }
// actions?: { edit?: (row) => void, delete?: (row) => void }
const Table = ({ data = [], columns = [], actions }) => {
  const renderCellContent = (row, column) => {
    const value = row[column.key];

    // Custom render function provided
    if (column.render) {
      return column.render(row);
    }

    // Specific key handling
    if (column.key === "isPremium") {
      return (
        <LiaStarSolid
          className="text-xl"
          color={value ? "#f2b530" : "gray"} // Use yellow for premium
          title={value ? "Premium" : "Free"}
        />
      );
    }
    if (column.key === "isEnabled") {
      return (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${value ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
        >
          {value ? "Enabled" : "Disabled"}
        </span>
      );
    }

    // Default rendering
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value instanceof Date) {
      return value.toLocaleDateString(); // Or format as needed
    }

    return value ?? "-"; // Display '-' for null/undefined
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {renderCellContent(row, column)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {actions.edit && (
                        <button
                          onClick={() => actions.edit(row)}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                      )}
                      {actions.delete && (
                        <button
                          onClick={() => actions.delete(row)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                      {actions.approve && ( // Example for upgrade requests
                        <button
                          onClick={() => actions.approve(row)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Approve"
                        >
                          Approve {/* Or use an icon */}
                        </button>
                      )}
                      {actions.reject && ( // Example for upgrade requests
                        <button
                          onClick={() => actions.reject(row)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Reject"
                        >
                          Reject {/* Or use an icon */}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
