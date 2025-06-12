import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePagination } from "../../hooks/usePage";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import Button from "../common/Button";
import { getReservationListByAdmin, cancelReservationByAdmin } from "../../api/placeApi";

const PlaceAdminComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 날짜 기본값 (한 달 전 ~ 오늘)
    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);

    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const sortBy = searchParams.get("sortBy") || "appliedAt";
    const orderBy = searchParams.get("orderBy") || "desc";
    const query = searchParams.get("query") || "";

    const searchFieldMap = {
        "회원ID": "mid",
        "회원 이름": "name",
        "장소": "room",
    };

    const validOptions = Object.values(searchFieldMap);
    const rawOption = searchParams.get("option");
    const option = Object.values(searchFieldMap).includes(rawOption)
  ? rawOption
  : searchFieldMap[rawOption] || "mid";

    const dateFrom = searchParams.get("startDate") || aMonthAgo.toISOString().slice(0, 10);
    const dateTo = searchParams.get("endDate") || today.toISOString().slice(0, 10);

    const { handleSearch } = useSearchHandler({ tab: "place", dateRange: { startDate: dateFrom, endDate: dateTo } });

    const sortByOption = useMemo(() => ({ "신청일": "appliedAt" }), []);
    const orderByOption = useMemo(() => ({ "오름차순": "asc", "내림차순": "desc" }), []);
    const sizeOption = useMemo(() => ({ "10개씩": "10", "50개씩": "50", "100개씩": "100" }), []);

    const fetchReservations = async () => {
        const params = {
            page: page - 1,
            size,
            startDate: dateFrom,
            endDate: dateTo,
            sortBy,
            orderBy,
        };
        if (option && query !== null && query !== undefined) {
            params.option = option;
            params.query = query;
        }
        return await getReservationListByAdmin(params);
    };

    const { data = { content: [], totalPages: 0 }, isLoading } = useQuery({
        queryKey: ["adminReservations", dateFrom, dateTo, option, query, page, size, sortBy, orderBy],
        queryFn: fetchReservations,
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => cancelReservationByAdmin(id),
        onSuccess: () => {
            alert("신청이 취소되었습니다.");
            queryClient.invalidateQueries(["adminReservations"]);
        },
    });

    const { renderPagination } = usePagination(data, searchParams, setSearchParams, isLoading);

    const searchOptions = ["회원ID", "회원 이름", "장소"];

    const defaultCategory = useMemo(() => {
        const entry = Object.entries(searchFieldMap).find(([label, field]) => field === option);
        return entry ? entry[0] : "회원ID";
    }, [option]);

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            {isLoading && <Loading text="목록 불러오는 중..." />}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">시설대여 관리</h1>

            {/* 검색 조건 헤더 */}
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-4 bg-gray-100 p-4 min-h-30">
                <SearchSelectComponent
                    options={searchOptions}
                    defaultCategory={defaultCategory}
                    input={query}
                    handleSearch={handleSearch}
                    selectClassName="mr-2 md:mr-5"
                    dropdownClassName="w-28 md:w-32"
                    className="w-full md:w-[50%] min-w-0"
                    inputClassName="w-full bg-white"
                />

                <div className="flex items-center gap-3 text-sm">
                    <label>신청기간</label>
                    <input
                        type="date"
                        name="startDate"
                        value={dateFrom}
                        onChange={(e) => setSearchParams(prev => {
                            const p = new URLSearchParams(prev);
                            p.set("startDate", e.target.value);
                            return p;
                        })}
                        className="border rounded p-2"
                    />
                    <span>~</span>
                    <input
                        type="date"
                        name="endDate"
                        value={dateTo}
                        onChange={(e) => setSearchParams(prev => {
                            const p = new URLSearchParams(prev);
                            p.set("endDate", e.target.value);
                            return p;
                        })}
                        className="border rounded p-2"
                    />
                </div>
            </div>

            {/* 정렬 */}
            <div className="flex justify-end items-center mb-5 gap-3">
                <SelectComponent onChange={(value) => {
                    const p = new URLSearchParams(searchParams);
                    p.set("sortBy", value);
                    setSearchParams(p);
                }} value={sortBy} options={sortByOption} />
                <SelectComponent onChange={(value) => {
                    const p = new URLSearchParams(searchParams);
                    p.set("orderBy", value);
                    setSearchParams(p);
                }} value={orderBy} options={orderByOption} />
                <SelectComponent onChange={(value) => {
                    const p = new URLSearchParams(searchParams);
                    p.set("size", value);
                    setSearchParams(p);
                }} value={size.toString()} options={sizeOption} />
            </div>

            {/* 테이블 */}
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white text-center">
                    <thead className="bg-[#00893B] text-white text-ms">
                        <tr>
                            <th className="py-3 px-2 w-12">번호</th>
                            <th className="py-3 px-2 w-32">회원ID</th>
                            <th className="py-3 px-2 w-28">이름</th>
                            <th className="py-3 px-2 w-40">신청일시</th>
                            <th className="py-3 px-2 w-32">이용일자</th>
                            <th className="py-3 px-2 w-24">장소</th>
                            <th className="py-3 px-2 w-36">이용시간</th>
                            <th className="py-3 px-2 w-16">인원</th>
                            <th className="py-3 px-2 w-24">신청취소</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {data.content.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="py-10 text-gray-500">신청 내역이 없습니다.</td>
                            </tr>
                        ) : (
                            data.content.map((item, index) => (
                                <tr key={item.pno} className="border-b">
                                    <td className="py-3">{index + 1 + (page - 1) * size}</td>
                                    <td className="py-3">{item.memberMid}</td>
                                    <td className="py-3">{item.memberName}</td>
                                    <td className="py-3">{dayjs(item.appliedAt).format("YYYY-MM-DD HH:mm")}</td>
                                    <td className="py-3">{item.useDate}</td>
                                    <td className="py-3">{item.room}</td>
                                    <td className="py-3">{item.startTime} ~ {item.endTime}</td>
                                    <td className="py-3">{item.people}명</td>
                                    <td className="py-3">
                                        <Button
                                            onClick={() => cancelMutation.mutate(item.pno)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                                        >
                                            취소
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6">{renderPagination()}</div>
        </div>
    );
};

export default PlaceAdminComponent;