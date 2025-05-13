import Button from "../common/Button";
import { useState, useEffect } from "react";
import SelectCopmonent from "../common/SelectComponent";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFsLibraryBookList } from "../../api/bookApi";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../routers/Loading";

const FilterSearchBookComponent = () => {
    const [filters, setFilters] = useState({
        title: "",
        isbn: "",
        author: "",
        yearStart: "",
        yearEnd: "",
        publisher: "",
        sortBy: "제목",
        orderBy: "오름차순",
        keyword: "",
        page: 1,
        size: 10
    });
    const [books, setBooks] = useState([]);
    const [pageable, setPageable] = useState({});
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const searchableParams = ['title', 'isbn', 'author', 'yearStart', 'yearEnd', 'publisher', 'keyword', 'page', 'size'];


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortByChange = (value) => {
        setFilters(prev => ({
            ...prev,
            sortBy: value
        }));
    };

    const handleOrderByChange = (value) => {
        setFilters(prev => ({
            ...prev,
            orderBy: value
        }));
    };

    useEffect(() => {
        const newFilters = {};
        searchableParams.forEach(key => {
            newFilters[key] = searchURLParams.get(key) || '';
        });
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, [searchURLParams]);







    const handleSearch = () => {
        const newParams = new URLSearchParams(filters);

        setSearchURLParams(newParams);
    };

    const { data, isLoading, isErrer } = useQuery({
        queryKey: ["librarybooklist", searchURLParams.toString()],
        queryFn: () => {
            return getFsLibraryBookList(searchURLParams);
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled: searchableParams.some(param => searchURLParams.has(param))
    });

    useEffect(() => {
        if (data) {
            setBooks(data.content);
            console.log(data.content);
            setPageable(data);
            if (!searchURLParams.has("page") && data.pageable) {
                const newParams = new URLSearchParams(searchURLParams);
                newParams.set("tab", "info");
                newParams.set("page", (data.pageable.pageNumber + 1).toString());
                setSearchURLParams(newParams, { replace: true });
            }
        }
    }, [data, searchURLParams, setSearchURLParams]);

        const pageClick = (page) => {
        const currentPageFromUrl = parseInt(searchURLParams.get("page") || "1", 10);
        if (page === currentPageFromUrl || isLoading) return;
        const newParams = new URLSearchParams(searchURLParams);
        newParams.set("page", page.toString());
        setSearchURLParams(newParams);
    };

    const { renderPagination } = usePagination(pageable, pageClick, isLoading);


    const sortOption = ["제목", "저자", "출판사", "발행연도"];
    const orderByOption = ["오름차순", "내림차순"];

    return (
        <div>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">도서명</p>
                    <input type="text" name="title" value={filters.title} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">ISBN</p>
                    <input type="text" name="isbn" value={filters.isbn} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">저자</p>
                    <input type="text" name="author" value={filters.author} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">발행연도</p>
                    <input type="number" name="yearStart" value={filters.yearStart} onChange={handleChange} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                    <span className="mx-2">-</span>
                    <input type="number" name="yearEnd" value={filters.yearEnd} onChange={handleChange} className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">출판사</p>
                    <input type="text" name="publisher" value={filters.publisher} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">정렬기준</p>
                    <SelectCopmonent options={sortOption} defaultCategory="제목" selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={handleSortByChange} />
                    <SelectCopmonent options={orderByOption} defaultCategory="오름차순" selectClassName="w-32 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00893B]" dropdownClassName="w-32" onChange={handleOrderByChange}  />
                </div>
                <div className="flex items-center col-span-2">
                    <p className="w-24 font-medium text-gray-700">키워드</p>
                    <input type="text" name="keyword" value={filters.keyword} onChange={handleChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00893B]"/>
                </div>
                <div className="col-span-2 flex justify-center mt-4">
                    <Button onClick={handleSearch} children="검색"/>
                </div>
            </div>
        </div>
            {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loading />
                    </div>
                ) : (
                    <>

                        {pageable.totalElements !== undefined ? (
                            <div className="mb-4">총 {pageable.totalElements}권의 도서를 찾았습니다. </div>
                        ) : (
                            <div>

                                    검색결과에 대하여 ${pageable.totalElements}권의 도서를 찾았습니다.

                            </div>
                        )}


                        <div className="space-y-6">
                            {Array.isArray(books) && books.length > 0 ? (
                                books.map((book, index) => {
                                    const key = book?.libraryBookId ?? `book-index-${index}`;
                                    if (!book) return null;

                                    return (
                                        <Link key={key}
                                            className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 gap-6 p-6"
                                            to={`/librarybook/${book.libraryBookId}`}
                                        >

                                            <div className="w-full md:w-48 flex justify-center">
                                                <img
                                                    src={book.cover || '/placeholder-image.png'}
                                                    alt={book.bookTitle || '표지 없음'}
                                                    className="h-64 object-contain"
                                                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-4">
                                                    {book.bookTitle || '제목 없음'}
                                                </h3>
                                                <div className="space-y-2 text-gray-600">
                                                    <p className="text-sm"><span className="font-medium">저자:</span> {book.author || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판사:</span> {book.publisher || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">출판일:</span> {book.pubDate || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">자료위치:</span> {book.location || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">청구기호:</span> {book.callSign || '-'}</p>
                                                    <p className="text-sm"><span className="font-medium">도서상태:</span>
                                                        {book.rented === undefined ? '-' : (book.rented ? "대출중" : "대출가능")}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                searchURLParams.has("query") ? (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500">검색 결과가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-10">
                                        <p className="text-gray-500">표시할 도서가 없습니다.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </>
                )}
                {renderPagination()}
            </div>

    );
}

export default FilterSearchBookComponent;