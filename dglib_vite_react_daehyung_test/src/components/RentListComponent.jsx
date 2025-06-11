import { getRentalList, returnBook } from "../api/bookApi";
import { useState, useEffect } from "react";

const RentListComponent = () => {
    const [rentalList, setRentalList] = useState([]);
    const [pageable, setPageable] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);

    useEffect(() => {
            const getRental = async () => {
                setIsLoading(true);
                const response = await getRentalList();
                setRentalList(response.content);
                setPageable(response);
                console.log("대여 목록:", response);
                setIsLoading(false);
            }
            getRental();
        }, []);
    useEffect(() => {
        if (rentalList.length > 0 && selectedItems.size === rentalList.length) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }

    }, [rentalList, selectedItems])
    useEffect(() => {
        setSelectedItems(new Set());
        setIsAllSelected(false);
    }, [pageable.pageable?.pageNumber]);
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setIsAllSelected(isChecked);
        if (isChecked) {
            const newSelectedItems = new Set();
            rentalList.forEach(item => {
            newSelectedItems.add(item.rentId);
        });
        setSelectedItems(newSelectedItems);
        } else {
        setSelectedItems(new Set());
        }
    }
    const handleSelectItem = (e, item) => {
        const isChecked = e.target.checked;
        setSelectedItems(prev => {
            const newSelectedItems = new Set(prev);
            if (isChecked) {
                newSelectedItems.add(item.rentId);
            } else {
                newSelectedItems.delete(item.rentId);
            }
            return newSelectedItems;
        });
    }

    const buttonClick = async () => {
        if (selectedItems.size === 0) {
            alert("반납할 도서를 선택하세요.");
            return;
        }
        setIsLoading(true);
        try {
            if (confirm("정말로 도서를 반납하시겠습니까?")) {
                console.log('selectedItems:', selectedItems);
                console.log('converted:', Array.from(selectedItems));
                await returnBook(Array.from(selectedItems));
                alert("도서 반납이 완료되었습니다.")
            }
        } catch (error) {
            console.log("예약 변경 오류:", error);
            alert(error.response.data.message);
        }
        const updatedListResponse = await getRentalList();
        setRentalList(updatedListResponse.content);
        setPageable(updatedListResponse);
        setSelectedItems(new Set());
        setIsAllSelected(false);
        setIsLoading(false);



    }

    const renderPagination = () => {
        if (!rentalList || !pageable.pageable) return null;
        const maxPage = 20;
        const totalPages = Math.min(pageable.totalPages, maxPage);
        const startPage = Math.floor((pageable.pageable.pageNumber) / 10) * 10 + 1;
        const endPage = Math.min(startPage + 9, totalPages);
        const pages = [];

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`mx-1 px-3 py-1 rounded ${pageable.pageable.pageNumber === i-1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => !isLoading && pageClick(i)}
                    disabled={isLoading}
                >
                    {i}
                </button>
            );
        }




        return (
            <div className="flex justify-center mt-4">
                 {pageable.pageable.pageNumber > 10 && (
                     <button
                        key="prev"
                        onClick={() => !isLoading && pageClick(startPage - 1)}
                        disabled={isLoading}
                        className={`mx-1 px-3 py-1 rounded bg-gray-200`}>
                        이전
                     </button>
                 )}
                 {pages}
                 {endPage < totalPages && (
                     <button
                        key="next"
                        onClick={() => !isLoading && pageClick(endPage + 1)}
                        disabled={isLoading}
                        className={`mx-1 px-3 py-1 rounded bg-gray-200`}>
                        다음
                    </button>
                 )}
            </div>
        );
    }

    const pageClick = async (page) => {
        if (page - 1 === pageable.pageable.pageNumber) return;
        setIsLoading(true);
        const response = await getRentalList(page);
        setRentalList(response.content);
        setPageable(response);
        setIsLoading(false);
    };



    if (isLoading && !rentalList.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">대출 목록</h1>
            {isLoading && rentalList.length > 0 && ( //
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">
                                <input type="checkbox"
                                       className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                                       checked={isAllSelected}
                                       onChange={handleSelectAll}
                                       disabled={rentalList.length === 0}
                                       />
                            </th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">회원ID</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">대여일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">반납예정일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">반납일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">연체 여부</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && rentalList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    대여한 도서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            rentalList.map((item, index) => {
                                const today = new Date();
                                const dueDate = new Date(item.dueDate);
                                today.setHours(0, 0, 0, 0);
                                dueDate.setHours(0, 0, 0, 0);

                                const isOverdue = item.state === "BORROWED" && dueDate < today;

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 ${isOverdue ? 'bg-red-50' : ''}`}>
                                        <td className="py-4 px-4">
                                            <input type="checkbox"
                                                    className="form=checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedItems.has(item.rentId)}
                                                    onChange={(e) => handleSelectItem(e, item)} />

                                        </td>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6">{item.bookTitle}</td>
                                        <td className="py-4 px-6">{item.author}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.rentStartDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.dueDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.returnDate || '-'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.state === "BORROWED" ? (isOverdue ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800") :
                                                item.state === "RETURNED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "BORROWED" ?  "대출중" : "반납완료"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {isOverdue ? (
                                                <span className="text-red-600 font-semibold">연체중</span>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end items-center space-x-3">
                <button
                    onClick={buttonClick}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    도서반납
                </button>
            </div>
            {renderPagination()}
        </div>
    );
}

export default RentListComponent;