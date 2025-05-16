import { getRentalList, returnBook } from "../../api/adminApi";
import { useState, useEffect, useMemo } from "react";
import { usePagination } from "../../hooks/usePagination";
import { useQuery, useMutation } from "@tanstack/react-query";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";


const BorrowBookListComponent = () => {

    const [pageable, setPageable] = useState({});
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const { data: rentalData = { content: [], pageable: { pageNumber: 0 } }, isLoading } = useQuery({
        queryKey: ['rentalList', currentPage],
        queryFn: () => getRentalList(),
    });

    const rentalList = useMemo(() => rentalData.content, [rentalData.content]); //확인

    const returnMutation = useMutation({
        mutationFn: async (rentIds) => {
            return await returnBook(rentIds);
        },
        onSuccess: () => {
            alert("도서 반납이 완료되었습니다.");
            setSelectedItems(new Set());
            setIsAllSelected(false);
        },
        onError: (error) => {
            console.log("도서 반납 오류:", error);
            alert("도서 반납에 실패했습니다. " + error.response?.data?.message);
        }
    });


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
        returnMutation.mutate(Array.from(selectedItems));
    }

    const pageClick = (page) => {
        if (page - 1 === currentPage) return;
        setCurrentPage(page - 1);
    };

    const { renderPagination } = usePagination(pageable, pageClick, isLoading);





    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">대출 목록</h1>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">
                                <CheckBox inputClassName="h-4 w-4" checked={isAllSelected} onChange={handleSelectAll} />
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
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
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
                                            <CheckBox inputClassName="h-4 w-4" checked={selectedItems.has(item.rentId)} onChange={(e) => handleSelectItem(e, item)} />
                                        </td>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
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
                <Button onClick={buttonClick}
                        className={"disabled:bg-[#82c8a0] disabled:cursor-not-allowed"}
                        children={"도서반납"}
                        disabled={selectedItems.size === 0 || isLoading}
                        />
            </div>
            {renderPagination()}
        </div>
    );
}

export default BorrowBookListComponent;