export default function PagingBar({ page, total, pageSize, onPageChange }) {
    const totalPages = Math.ceil(total / pageSize);
    

    const rangeStart = Math.max(1, page - 1);
    const rangeEnd = Math.min(totalPages, page + 1);

    const pageNumbers = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
    }

    const handlePrev = () => {
        if (page > 1) onPageChange(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) onPageChange(page + 1);
    };

    return (
        <div className="flex justify-center items-center md:gap-2 gap-1 mt-4  text-xs md:text-base">

            <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-3 py-1 border rounded bg-gray-200 text-black  disabled:opacity-50"
            >
                Prev
            </button>

            {totalPages > 4 && page > 3 && (
                <span onClick={() => onPageChange(1)} className="cursor-pointer">1</span>
            )}
            {totalPages > 4 && page > 3 && <span className="px-1">...</span>}

            {pageNumbers.map((pageNum) => (
                <button
                    key={pageNum}
                    className={`px-3 py-1 border rounded ${page === pageNum ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}
                    onClick={() => onPageChange(pageNum)}
                >
                    {pageNum}
                </button>
            ))}

            {totalPages > 4 && page < totalPages - 2 && (
                <span className="px-1">...</span>
            )}
            {totalPages > 4 && page < totalPages - 2 && (
                <span onClick={() => onPageChange(totalPages)} className="cursor-pointer">{totalPages}</span>
            )}

            <button
                onClick={handleNext}
                disabled={page === totalPages}
                className=" px-3 py-1 border rounded bg-gray-200 text-black disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}