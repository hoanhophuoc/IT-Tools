"use client";
import Button from "./Button"; // Use your Button component

const PagingBar = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null; // Don't render if only one page or less
  }

  const handlePageClick = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      onPageChange(pageNumber);
    }
  };

  // Simple pagination logic - can be made more complex (e.g., ellipsis)
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Max number of page buttons to show
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      // Less than max pages, show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // More than max pages, calculate range
      const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    // Create buttons
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => handlePageClick(i)}
          variant={i === currentPage ? "primary" : "secondary"}
          size="sm"
          className={i === currentPage ? "z-10" : ""} // Highlight current page
        >
          {i}
        </Button>,
      );
    }

    // Add ellipsis and first/last page buttons if needed
    if (startPage > 1) {
      pageNumbers.unshift(
        <Button key="start-ellipsis" variant="secondary" size="sm" disabled>
          ...
        </Button>,
      );
      pageNumbers.unshift(
        <Button
          key={1}
          onClick={() => handlePageClick(1)}
          variant="secondary"
          size="sm"
        >
          1
        </Button>,
      );
    }
    if (endPage < totalPages) {
      pageNumbers.push(
        <Button key="end-ellipsis" variant="secondary" size="sm" disabled>
          ...
        </Button>,
      );
      pageNumbers.push(
        <Button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          variant="secondary"
          size="sm"
        >
          {totalPages}
        </Button>,
      );
    }

    return pageNumbers;
  };

  return (
    <nav
      className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-700"
      aria-label="Pagination"
    >
      {/* Info Text (Optional) */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> results
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-1 justify-between gap-1 sm:justify-end">
        <Button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          Previous
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {renderPageNumbers()}
        </div>
        <Button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>
      </div>
    </nav>
  );
};

export default PagingBar;
