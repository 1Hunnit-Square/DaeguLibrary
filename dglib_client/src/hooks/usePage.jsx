import { useCallback, useEffect, useRef } from 'react';

export const usePagination = (
  pageable,
  searchURLParams,
  setSearchURLParams,
  isLoading,
  onPageReset = () => {},
  scrollRef = null,
) => {
    const page = searchURLParams.get("page") || "1";
    const didMountRef = useRef(false);
    useEffect(() => {
      if (!isLoading && scrollRef && scrollRef.current) { 
        if (didMountRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
          didMountRef.current = true;
        }
      }
    }, [page, isLoading, scrollRef]);
    const pageClick = useCallback((page) => {
    const currentPageFromUrl = parseInt(searchURLParams.get("page") || "1", 10);


    if (page === currentPageFromUrl || isLoading) return;

    const newParams = new URLSearchParams(searchURLParams);
    newParams.set("page", page.toString());
    setSearchURLParams(newParams);

    if (onPageReset) {
      onPageReset();
    }
  }, [searchURLParams, isLoading, setSearchURLParams, onPageReset]);

  const renderPagination = () => {
    if (!pageable || !pageable.pageable) return null;
    const totalPages = pageable.totalPages;
    const startPage = Math.floor((pageable.pageable.pageNumber) / 10) * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`mx-1 px-3 py-1 rounded ${pageable.pageable.pageNumber === i-1 ? 'bg-[#00893B] text-white' : 'bg-gray-200'}`}
          onClick={() => !isLoading && pageClick(i)}
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
            onClick={() => !isLoading && pageClick(startPage - 1)}
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
            onClick={() => !isLoading && pageClick(endPage + 1)}
            disabled={isLoading}
            className={`mx-1 px-3 py-1 rounded bg-gray-200`}
          >
            다음
          </button>
        )}
      </div>
    );
  };

  return { renderPagination, pageClick };
};