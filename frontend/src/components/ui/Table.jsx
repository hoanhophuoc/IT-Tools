"use client";
import React, { useState, useMemo } from "react";
import {
  FiEdit,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { LiaStarSolid } from "react-icons/lia";

const DEFAULT_DATA = [];
const DEFAULT_COLUMNS = [];
const DEFAULT_INITIAL_SORT = [];

const isDateValue = (val) => {
  if (val instanceof Date) return true;
  if (typeof val === "string" && val.length >= 10) {
    return /^\d{4}-\d{2}-\d{2}/.test(val) && !Number.isNaN(Date.parse(val));
  }
  return false;
};

const compareValues = (a, b, direction) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  let result = 0;

  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else if (typeof a === "boolean" && typeof b === "boolean") {
    result = a === b ? 0 : a ? -1 : 1;
  } else if (isDateValue(a) && isDateValue(b)) {
    const aTime = a instanceof Date ? a.getTime() : Date.parse(a);
    const bTime = b instanceof Date ? b.getTime() : Date.parse(b);
    result = aTime - bTime;
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  return direction === "desc" ? -result : result;
};

const renderCellContent = (row, column) => {
  const value = row[column.key];

  if (column.render) {
    return column.render(row);
  }

  if (column.key === "isPremium") {
    return (
      <LiaStarSolid
        className="text-xl"
        color={value ? "#f2b530" : "gray"}
        title={value ? "Premium" : "Free"}
      />
    );
  }
  if (column.key === "isEnabled") {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          value
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {value ? "Enabled" : "Disabled"}
      </span>
    );
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { timeZone: "UTC" });
  }

  return value ?? "-";
};

function TableToolbar({
  searchable,
  searchTerm,
  setSearchTerm,
  searchPlaceholder,
  displayCount,
  totalCount,
  showSortBar,
  availableSortColumns,
  addSortRule,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50/90 p-3 text-xs dark:border-gray-700 dark:bg-gray-800/80 sm:flex-row sm:items-center sm:justify-between">
      {searchable && (
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-gray-300 bg-white py-1.5 pr-7 pl-8 text-xs text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-indigo-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Clear search"
            >
              <FiX size={12} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {displayCount}
          </span>{" "}
          of {totalCount} items
          {searchTerm && " (filtered)"}
        </span>

        {showSortBar && availableSortColumns.length > 0 && (
          <select
            value=""
            aria-label="Add sort field"
            onChange={(e) => {
              if (e.target.value) {
                addSortRule(e.target.value);
              }
            }}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="" disabled>
              + Add sort field...
            </option>
            {availableSortColumns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function TableSortBar({
  sortRules,
  columns,
  toggleSortDirection,
  removeSortRule,
  clearAllSorts,
}) {
  if (sortRules.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-indigo-50/40 px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-indigo-950/20">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-indigo-900 dark:text-indigo-300">
          Sort:
        </span>
        {sortRules.map((rule, idx) => {
          const col = columns.find((c) => c.key === rule.key);
          const label = col?.label || rule.key;
          return (
            <span
              key={rule.key}
              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-0.5 text-xs font-medium text-indigo-700 shadow-xs dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-300"
            >
              <span className="font-bold">{idx + 1}.</span>
              <span>{label}</span>
              <button
                type="button"
                onClick={() => toggleSortDirection(rule.key)}
                className="font-bold hover:underline"
                title="Toggle Ascending / Descending"
              >
                {rule.direction === "asc" ? "▲ ASC" : "▼ DESC"}
              </button>
              <button
                type="button"
                onClick={() => removeSortRule(rule.key)}
                className="ml-0.5 text-indigo-400 hover:text-indigo-900 dark:hover:text-white"
                title="Remove field"
              >
                <FiX size={12} />
              </button>
            </span>
          );
        })}
        <button
          type="button"
          onClick={clearAllSorts}
          className="ml-1 text-xs text-gray-500 underline hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Reset sort
        </button>
      </div>
      <span className="hidden text-[11px] text-gray-400 xl:inline dark:text-gray-500">
        (Hold Shift + click column header for multi-sort)
      </span>
    </div>
  );
}

function TableHeader({ columns, sortRules, onHeaderClick, hasActions }) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {columns.map((column) => {
          const isSortable = column.sortable !== false;
          const ruleIndex = sortRules.findIndex((r) => r.key === column.key);
          const activeRule = ruleIndex !== -1 ? sortRules[ruleIndex] : null;

          return (
            <th
              key={column.key}
              scope="col"
              tabIndex={isSortable ? 0 : undefined}
              onClick={(e) =>
                isSortable && onHeaderClick(column.key, e.shiftKey)
              }
              onKeyDown={(e) => {
                if (isSortable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onHeaderClick(column.key, e.shiftKey);
                }
              }}
              className={`select-none px-4 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                isSortable
                  ? "cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                  : "text-gray-500 dark:text-gray-300"
              } ${
                activeRule
                  ? "font-bold text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-300"
              }`}
              title={
                isSortable
                  ? "Click to sort. Hold Shift + click to sort by multiple fields."
                  : undefined
              }
            >
              <div className="flex items-center gap-1.5">
                <span>{column.label}</span>
                {isSortable && (
                  <span className="inline-flex items-center text-xs">
                    {ruleIndex !== -1 && sortRules.length > 1 && (
                      <span className="mr-0.5 rounded-full bg-indigo-100 px-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {ruleIndex + 1}
                      </span>
                    )}
                    {activeRule?.direction === "asc" ? (
                      <FiChevronUp
                        className="text-indigo-600 dark:text-indigo-400"
                        size={15}
                      />
                    ) : activeRule?.direction === "desc" ? (
                      <FiChevronDown
                        className="text-indigo-600 dark:text-indigo-400"
                        size={15}
                      />
                    ) : (
                      <span className="flex flex-col text-[8px] leading-[4px] text-gray-300 hover:text-gray-400 dark:text-gray-500">
                        <span>▲</span>
                        <span>▼</span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}
        {hasActions && (
          <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
          >
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
}

function getRowKey(row) {
  return (
    row.toolId ||
    row.userId ||
    row.requestId ||
    row.id ||
    row.key ||
    row.slug ||
    row.email ||
    JSON.stringify(row)
  );
}

function TableBody({
  columns,
  displayData,
  searchTerm,
  onClearSearch,
  actions,
}) {
  if (displayData.length === 0) {
    return (
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <tr>
          <td
            colSpan={columns.length + (actions ? 1 : 0)}
            className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {searchTerm ? (
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-300">
                  No items found matching &quot;{searchTerm}&quot;
                </p>
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="mt-2 text-xs font-medium text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              "No data available."
            )}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
      {displayData.map((row) => (
        <tr
          key={getRowKey(row)}
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
                {actions.approve && (
                  <button
                    onClick={() => actions.approve(row)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Approve"
                  >
                    Approve
                  </button>
                )}
                {actions.reject && (
                  <button
                    onClick={() => actions.reject(row)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Reject"
                  >
                    Reject
                  </button>
                )}
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}

const Table = ({
  data = DEFAULT_DATA,
  columns = DEFAULT_COLUMNS,
  actions,
  initialSort = DEFAULT_INITIAL_SORT,
  showSortBar = true,
  searchable = true,
  searchPlaceholder = "Search in table...",
}) => {
  const [sortRules, setSortRules] = useState(initialSort);
  const [searchTerm, setSearchTerm] = useState("");

  const handleHeaderClick = (key, isShiftPressed) => {
    setSortRules((prev) => {
      const existingIdx = prev.findIndex((rule) => rule.key === key);

      if (isShiftPressed) {
        if (existingIdx === -1) {
          return [...prev, { key, direction: "asc" }];
        }
        if (prev[existingIdx].direction === "asc") {
          const next = [...prev];
          next[existingIdx] = { key, direction: "desc" };
          return next;
        }
        return prev.filter((rule) => rule.key !== key);
      }

      if (existingIdx !== -1 && prev.length === 1) {
        if (prev[0].direction === "asc") {
          return [{ key, direction: "desc" }];
        }
        return [];
      }

      return [{ key, direction: "asc" }];
    });
  };

  const toggleSortDirection = (key) => {
    setSortRules((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, direction: r.direction === "asc" ? "desc" : "asc" }
          : r,
      ),
    );
  };

  const removeSortRule = (key) => {
    setSortRules((prev) => prev.filter((r) => r.key !== key));
  };

  const addSortRule = (key) => {
    setSortRules((prev) => {
      if (prev.some((r) => r.key === key)) return prev;
      return [...prev, { key, direction: "asc" }];
    });
  };

  const clearAllSorts = () => {
    setSortRules([]);
  };

  const sortedData = useMemo(() => {
    if (!sortRules.length || !data.length) return data;

    const columnMap = new Map(columns.map((c) => [c.key, c]));

    return [...data].sort((a, b) => {
      for (const rule of sortRules) {
        const col = columnMap.get(rule.key);
        const aVal = col?.sortValue ? col.sortValue(a) : a[rule.key];
        const bVal = col?.sortValue ? col.sortValue(b) : b[rule.key];
        const res = compareValues(aVal, bVal, rule.direction);
        if (res !== 0) return res;
      }
      return 0;
    });
  }, [data, sortRules, columns]);

  const displayData = useMemo(() => {
    if (!searchTerm.trim()) return sortedData;
    const q = searchTerm.toLowerCase().trim();

    return sortedData.filter((row) => {
      return columns.some((col) => {
        const val = col.sortValue ? col.sortValue(row) : row[col.key];
        if (val === null || val === undefined) return false;
        if (typeof val === "boolean") {
          return (
            val ? "yes enabled true premium" : "no disabled false free"
          ).includes(q);
        }
        if (val instanceof Date) {
          return val.toLocaleDateString("en-US", { timeZone: "UTC" }).toLowerCase().includes(q);
        }
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [sortedData, searchTerm, columns]);

  const availableSortColumns = useMemo(() => {
    return columns.filter(
      (col) =>
        col.sortable !== false && !sortRules.some((r) => r.key === col.key),
    );
  }, [columns, sortRules]);

  const shouldShowToolbar =
    searchable ||
    (showSortBar &&
      (sortRules.length > 0 || columns.some((c) => c.sortable !== false)));

  return (
    <div className="w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      {shouldShowToolbar && (
        <TableToolbar
          searchable={searchable}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder={searchPlaceholder}
          displayCount={displayData.length}
          totalCount={data.length}
          showSortBar={showSortBar}
          availableSortColumns={availableSortColumns}
          addSortRule={addSortRule}
        />
      )}

      {showSortBar && (
        <TableSortBar
          sortRules={sortRules}
          columns={columns}
          toggleSortDirection={toggleSortDirection}
          removeSortRule={removeSortRule}
          clearAllSorts={clearAllSorts}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader
            columns={columns}
            sortRules={sortRules}
            onHeaderClick={handleHeaderClick}
            hasActions={Boolean(actions)}
          />
          <TableBody
            columns={columns}
            displayData={displayData}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm("")}
            actions={actions}
          />
        </table>
      </div>
    </div>
  );
};

export default Table;
