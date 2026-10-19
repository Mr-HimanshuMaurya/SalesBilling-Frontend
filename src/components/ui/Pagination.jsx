import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const visiblePages = new Set([
      1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);
    const range = [...visiblePages]
      .filter((page) => page > 0 && page <= totalPages)
      .sort((left, right) => left - right);
    const rangeWithDots = [];
    let previousPage;

    for (const page of range) {
      if (previousPage) {
        if (page - previousPage === 2) {
          rangeWithDots.push(previousPage + 1);
        } else if (page - previousPage > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(page);
      previousPage = page;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-3"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-2 text-gray-400 select-none pb-1"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={
                page === currentPage
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white min-w-[32px]"
                  : "min-w-[32px]"
              }
            >
              {page}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3"
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
