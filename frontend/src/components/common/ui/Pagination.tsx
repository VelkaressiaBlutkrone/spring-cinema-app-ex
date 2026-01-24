/**
 * 페이징 컴포넌트
 */
import { memo, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const Pagination = memo(({ currentPage, totalPages, totalElements, onPageChange }: PaginationProps) => {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i), [totalPages]);

  const visiblePages = useMemo(() => {
    return pages.slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3));
  }, [pages, currentPage, totalPages]);

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
      <div className="text-sm text-gray-600 whitespace-nowrap">
        전체 {totalElements.toLocaleString()}개
      </div>

      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="min-h-[44px] min-w-[44px] px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          aria-label="이전 페이지"
        >
          <span className="hidden sm:inline">이전</span>
          <span className="sm:hidden">‹</span>
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`min-h-[44px] min-w-[44px] px-3 py-2 border rounded-md transition-colors touch-manipulation ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-label={`${page + 1}페이지`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page + 1}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className="min-h-[44px] min-w-[44px] px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          aria-label="다음 페이지"
        >
          <span className="hidden sm:inline">다음</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';
