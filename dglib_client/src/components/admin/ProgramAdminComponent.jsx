import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProgramList, deleteProgram } from "../../api/programApi";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { usePagination } from "../../hooks/usePage";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import Button from "../common/Button";

const ProgramAdminComponent = () => {
    const getProgramStatus = (applyStartAt, applyEndAt, current, capacity) => {
        const now = new Date();
        const start = new Date(applyStartAt);
        const end = new Date(applyEndAt);

        if (now < start) return '신청전';
        if (now > end) return '신청마감';
        if (current >= capacity) return '모집마감';
        return '신청중';
    };

    const searchFieldMap = {
        "프로그램명": "progName",
        "강사명": "teachName",
    };

    const orderByOption = useMemo(() => ({ 오름차순: "asc", 내림차순: "desc" }), []);
    const sortByOption = useMemo(() => ({ 등록일: "createdAt" }), []);
    const sizeOption = useMemo(() => ({ "10개씩": "10", "50개씩": "50", "100개씩": "100" }), []);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleSearch } = useSearchHandler({ tab: "program" });

    const { dateRange, handleDateChange } = useDateRangeHandler();

    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);

    const format = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
    const startDate = dateRange.startDate || format(aMonthAgo);
    const endDate = dateRange.endDate || format(today);

    const orderBy = searchParams.get("orderBy") || "desc";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");

    const rawOption = searchParams.get("option");
    const option = Object.values(searchFieldMap).includes(rawOption)
        ? rawOption
        : searchFieldMap[rawOption] || "progName";
    const query = searchParams.get("query") || "";

    const { data = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ["programList", startDate, endDate, option, query, page, size, sortBy, orderBy],
        queryFn: () => {
            const params = {
                option: option,
                query: query,
                startDate,
                endDate,
                sort: `${sortBy},${orderBy}`,
                size,
            };
            if (query) {
                params[option] = query;
            }
            return getAdminProgramList(params);
        },
    });

    const { renderPagination } = usePagination(data, searchParams, setSearchParams, isLoading);

    const defaultCategory = useMemo(() => {
        const entry = Object.entries(searchFieldMap).find(([label, field]) => field === option);
        return entry ? entry[0] : "프로그램명";
    }, [option]);

    // 삭제 기능
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: deleteProgram,
        onSuccess: () => {
            alert("삭제가 완료되었습니다.");
            queryClient.invalidateQueries(["programList"]);
        },
        onError: () => {
            alert("삭제 중 오류가 발생했습니다.");
        },
    });

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            {isLoading && <Loading text="목록 불러오는 중..." />}

            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">프로그램 관리</h1>

            {/* 검색 조건 헤더 */}
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-10 rounded-xl bg-gray-100 shadow p-2 min-h-30">
                <SearchSelectComponent
                    options={Object.keys(searchFieldMap)}
                    defaultCategory={defaultCategory}
                    className="w-full md:w-[40%]"
                    inputClassName="w-full bg-white"
                    selectClassName="mr-2 whitespace-nowrap"
                    dropdownClassName="w-28 md:w-32 whitespace-nowrap"
                    input={query}
                    handleSearch={handleSearch}
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap mx-2">신청기간</span>
                    <input type="date" name="start" value={startDate} onChange={handleDateChange} className="border bg-white rounded-md p-2" />
                    <span className="mx-2">-</span>
                    <input type="date" name="end" value={endDate} onChange={handleDateChange} className="border bg-white rounded-md p-2" />
                </div>
            </div>

            {/* 정렬 */}
            <div className="flex justify-end items-center mb-5 gap-2">
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
                            <th className="py-3 px-6">번호</th>
                            <th className="py-3 px-6">강사명</th>
                            <th className="py-3 px-6">프로그램명</th>
                            <th className="py-3 px-6">신청현황</th>
                            <th className="py-3 px-6">강의상태</th>
                            <th className="py-3 px-6">등록일</th>
                            <th className="py-3 px-6">등록삭제</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {!isLoading && data.content.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-10 text-gray-500">등록된 프로그램이 없습니다.</td>
                            </tr>
                        ) : (
                            data.content.map((item, idx) => (
                                <tr key={idx} className="border border-gray-200">
                                    <td className="py-3">{idx + 1 + (page - 1) * size}</td>
                                    <td className="py-3 px-4">{item.teachName}</td>
                                    <td
                                        className="py-4 px-4 font-semibold cursor-pointer hover:underline"
                                        onClick={() => navigate(`/admin/progmanagement/programdetail/${item.progNo}`)}
                                    >
                                        {item.progName}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`font-bold ${item.capacity > 0 && item.current / item.capacity >= 0.8
                                                ? "text-red-600"
                                                : "text-blue-700"
                                                }`}
                                        >
                                            {item.current}
                                        </span>
                                        {" / "}
                                        {item.capacity}
                                    </td>
                                    <td className="py-3 px-4">
                                        {getProgramStatus(item.applyStartAt, item.applyEndAt, item.current, item.capacity)}
                                    </td>
                                    <td className="py-3 px-4">{item.createdAt}</td>
                                    <td className="py-3 px-4">
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs !px-2 !py-1.5 rounded"
                                            onClick={() => {
                                                const confirmed = window.confirm("정말 삭제하시겠습니까?");
                                                if (confirmed) {
                                                    deleteMutation.mutate(item.progNo);
                                                }
                                            }}
                                        >
                                            삭제
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-8">
                <Button onClick={() => navigate("/admin/programregister")}>
                    프로그램 등록
                </Button>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6">{renderPagination()}</div>
        </div>
    );
};

export default ProgramAdminComponent;
