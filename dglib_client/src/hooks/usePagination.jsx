import { useState } from 'react';

export const usePagination = (pageable, onPageChange, isLoading) => {
  const renderPagination = () => {
    if (!pageable || !pageable.pageable) return null;
    const maxPage = 20;
    const totalPages = pageable.totalPages;
    const startPage = Math.floor((pageable.pageable.pageNumber) / 10) * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`mx-1 px-3 py-1 rounded ${pageable.pageable.pageNumber === i-1 ? 'bg-[#00893B] text-white' : 'bg-gray-200'}`}
          onClick={() => !isLoading && onPageChange(i)}
          disabled={isLoading}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-4">
        {startPage > 10 && (
          <button
            key="prev"
            onClick={() => !isLoading && onPageChange(startPage - 1)}
            disabled={isLoading}
            className={`mx-1 px-3 py-1 rounded bg-gray-200`}
          >
            이전
          </button>
        )}
        {pages}
        {endPage < totalPages && (
          <button
            key="next"
            onClick={() => !isLoading && onPageChange(endPage + 1)}
            disabled={isLoading}
            className={`mx-1 px-3 py-1 rounded bg-gray-200`}
          >
            다음
          </button>
        )}
      </div>
    );
  };

  return { renderPagination };
};