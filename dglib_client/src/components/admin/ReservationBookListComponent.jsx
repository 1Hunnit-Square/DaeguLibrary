import { getReserveBookList, cancelReserveBook, reReserveBook, completeBorrowing } from "../../api/adminApi";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CheckBox from "../common/CheckBox";

const ReservationBookListComponent = () => {

    const [pageable, setPageable] = useState({});
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");

    const { data: reserveData = { content: [], pageable: { pageNumber: 0 } }, isLoading } = useQuery({
        queryKey: ['reserveList'],
        queryFn: () => getReserveBookList(),
    });
    const reserveList = useMemo(() => reserveData.content, [reserveData.content]); //확인


    useEffect(() => {
        if (reserveList.length > 0 && selectedItems.size === reserveList.length) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }

    }, [reserveList, selectedItems])
    useEffect(() => {
        setSelectedItems(new Map());
        setIsAllSelected(false);
    }, [pageable.pageable?.pageNumber]);

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setIsAllSelected(isChecked);
        if (isChecked) {
            const newSelectedItems = new Map();
            reserveList.forEach(item => {
            if (item && typeof item.reserveId !== 'undefined') {
                newSelectedItems.set(item.reserveId, {
                    reserveId: item.reserveId,
                    state: item.state,
                    reservationRank: item.reservationRank,
                    libraryBookId: item.libraryBookId,
                    mid: item.mid,

                });
            }
        });
        setSelectedItems(newSelectedItems);
        } else {
        setSelectedItems(new Map());
        }
    }
    const handleSelectItem = (e, item) => {
        const isChecked = e.target.checked;
        setSelectedItems(prev => {
            const newSelectedItems = new Map(prev);
            if (isChecked) {
                newSelectedItems.set(item.reserveId, {
                    reserveId: item.reserveId,
                    state: item.state,
                    reservationRank: item.reservationRank,
                    libraryBookId: item.libraryBookId,
                    mid: item.mid,
                });
            } else {
                newSelectedItems.delete(item.reserveId);
            }
            return newSelectedItems;
        })

    }
    const buttonClick = async () => {
        if (selectedItems.size === 0 || !selectedAction) {
            alert("변경할 예약을 선택하세요.");
            return;
        }

        try {
            switch (selectedAction) {
                case "CANCELED":
                    await cancelReserveBook(Array.from(selectedItems.values()));
                    alert("예약이 취소되었습니다.");
                    break;
                case "RESERVED":
                    await reReserveBook(Array.from(selectedItems.values()));
                    alert("예약이 완료되었습니다.");
                    break;
                case "BORROWED":
                    if (confirm("정말로 대출을 완료하시겠습니까?")) {
                        await completeBorrowing(Array.from(selectedItems.values()));
                        alert("대출이 완료되었습니다.");
                    }
            }

        } catch (error) {
            console.log("예약 변경 오류:", error);
            alert(error.response.data.message);

        }
        const updatedListResponse = await getReserveBookList();

        setPageable(updatedListResponse);
        setSelectedItems(new Map());
        setSelectedAction("");
        setIsAllSelected(false);



    }

    if (isLoading && !reserveList.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">예약 목록</h1>
            {isLoading && reserveList.length > 0 && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00893B]"></div>
                </div>
            )}
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
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">신청일</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">우선순위</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase">상태</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && reserveList.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    예약한 도서가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            reserveList.map((item) => {
                                return (
                                    <tr key={item.reserveId} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`}>
                                        <td className="py-4 px-4">
                                            <CheckBox inputClassName="h-4 w-4" checked={selectedItems.has(item.reserveId)} onChange={(e) => handleSelectItem(e, item)} />
                                        </td>
                                        <td className="py-4 px-6">{item.mid}</td>
                                        <td className="py-4 px-6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.bookTitle}>{item.bookTitle}</td>
                                        <td className="py-4 px-6 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.author}>{item.author}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.isbn}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.reserveDate}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{item.reservationRank !== null ? item.reservationRank + "순위" : "-"}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.state === "RESERVED" ?  "bg-yellow-200 text-yellow-800" :
                                                item.state === "BORROWED" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                                            }`}>
                                                {item.state === "RESERVED" ?  "예약중" : item.state === "BORROWED" ? "대출완료" : "예약취소"}
                                            </span>
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end items-center space-x-3">
                <select
                    className="border border-gray-300 rounded-md p-2 text-sm focus:ring-[#00893B] focus:border-[#00893B]"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                >
                    <option value="" hidden></option>
                    <option value="CANCELED">예약취소</option>
                    <option value="RESERVED">예약중</option>
                    <option value="BORROWED">대출완료</option>
                </select>
                <button
                    onClick={buttonClick}
                    className="px-4 py-2 bg-[#00893B] text-white text-sm font-medium rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#00893B] focus:ring-offset-2 transition ease-in-out duration-150 disabled:bg-[#82c8a0] disabled:cursor-not-allowed"
                    disabled={selectedItems.size === 0 || !selectedAction || isLoading}
                >
                    변경
                </button>
            </div>
        </div>
    );
}

export default ReservationBookListComponent;