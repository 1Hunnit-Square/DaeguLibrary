import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminQnaList } from "../../api/qnaApi";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import { usePagination } from "../../hooks/usePage";

const QnaComponent = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();

    const searchFieldMap = { "회원 ID": "id", "작성자": "name", "제목": "title" };
    const searchOptions = Object.keys(searchFieldMap);
    const statusOptions = { 처리상황: "전체", 접수: "접수", 완료: "완료" };
    const sortOptions = { 최신순: "desc", 오래된순: "asc" };
    const sizeOptions = { "10개씩": 10, "20개씩": 20 };

    const today = new Date();
    const aMonthAgo = new Date(today);
    aMonthAgo.setDate(today.getDate() - 30);

    const format = (d) => d.toLocaleDateString("sv-SE");
    const startDate = dateRange.startDate || format(aMonthAgo);
    const endDate = dateRange.endDate || format(today);

    const rawOption = searchParams.get("option");
    const option = Object.values(searchFieldMap).includes(rawOption)
        ? rawOption
        : searchFieldMap[rawOption] || "id";
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "전체";
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const sort = searchParams.get("sort") || "desc";

    const defaultCategory = useMemo(() => {
        const entry = Object.entries(searchFieldMap).find(([_, val]) => val === option);
        return entry ? entry[0] : "회원 ID";
    }, [option]);

    const { data = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ["adminQnaList", option, query, startDate, endDate],
        queryFn: () =>
            getAdminQnaList({
                searchType: option,
                searchKeyword: query,
                start: startDate,
                end: endDate,
                page: 0,
                size: 9999,
            }),
    });



    const filteredContent = useMemo(() => {
        let list = status === "전체" ? data.content : data.content.filter((item) => item.status === status);
        list = [...list].sort((a, b) => {
            const aDate = new Date(a.postedAt);
            const bDate = new Date(b.postedAt);
            return sort === "desc" ? bDate - aDate : aDate - bDate;
        });
        return list;
    }, [data.content, status, sort]);

    const paginatedContent = useMemo(() => {
        const startIdx = (page - 1) * size;
        return filteredContent.slice(startIdx, startIdx + size);
    }, [filteredContent, page, size]);

    const paginationData = useMemo(() => ({
        pageable: { pageNumber: page - 1 },
        totalPages: Math.ceil(filteredContent.length / size),
        totalElements: filteredContent.length,
    }), [filteredContent.length, page, size]);

    const { renderPagination } = usePagination(paginationData, searchParams, setSearchParams, isLoading);

    const handleSearch = (newQuery, newOption) => {
        const params = new URLSearchParams(searchParams);
        params.set("query", newQuery);
        params.set("option", searchFieldMap[newOption]);
        params.set("page", "1");
        setSearchParams(params);
    };

    const handleStatusChange = (value) => {
        const p = new URLSearchParams(searchParams);
        p.set("status", value);
        p.set("page", "1");
        setSearchParams(p);
    };

    const handleSortChange = (value) => {
        const p = new URLSearchParams(searchParams);
        p.set("sort", value);
        p.set("page", "1");
        setSearchParams(p);
    };

    const handleSizeChange = (value) => {
        const p = new URLSearchParams(searchParams);
        p.set("size", value);
        p.set("page", "1");
        setSearchParams(p);
    };

    const handleDetail = (qno) => {
        navigate(`/community/qna/${qno}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            {isLoading && <Loading text="목록 불러오는 중..." />}

            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">QnA 관리</h1>

            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-10 rounded-xl bg-gray-100 shadow p-4 min-h-30">
                <SearchSelectComponent
                    options={searchOptions}
                    defaultCategory={defaultCategory}
                    className="w-full md:w-[40%]"
                    inputClassName="w-full bg-white"
                    buttonClassName="right-2 top-5"
                    dropdownClassName="w-24 md:w-32"
                    input={query}
                    handleSearch={handleSearch}
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">등록일</span>
                    <input type="date" name="startDate" value={startDate} onChange={handleDateChange} className="border bg-white rounded-md p-2" />
                    <span className="mx-1">-</span>
                    <input type="date" name="endDate" value={endDate} onChange={handleDateChange} className="border bg-white rounded-md p-2" />
                </div>
            </div>

            <div className="flex justify-end items-center mt-6">
                <div className="flex items-center gap-2">
                    <SelectComponent value={status} options={statusOptions} onChange={handleStatusChange} />
                </div>

                <div className="flex items-center gap-2">
                    <SelectComponent value={sort} options={sortOptions} onChange={handleSortChange} />
                </div>

                <div className="flex items-center gap-2">
                    <SelectComponent value={size} options={sizeOptions} onChange={handleSizeChange} />
                </div>
            </div>

            <div className="shadow-md rounded-lg overflow-x-auto mt-4">
                <table className="w-full bg-white table-fixed">
                    <colgroup>
                        <col style={{ width: '5%' }} />   {/* 번호 */}
                        <col style={{ width: '7%' }} />   {/* 상태 */}
                        <col style={{ width: '35%' }} />  {/* 제목 */}
                        <col style={{ width: '7%' }} />   {/* 공개여부 */}
                        <col style={{ width: '10%' }} />  {/* 작성자 */}
                        <col style={{ width: '14%' }} />  {/* 등록일 */}
                        <col style={{ width: '14%' }} />  {/* 수정일 */}
                        <col style={{ width: '8%' }} />   {/* 조회수 */}
                    </colgroup>
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">번호</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">상태</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">제목</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">공개여부</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">작성자</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">등록일</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">수정일</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold uppercase">조회수</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {paginatedContent.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    등록된 QnA가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            paginatedContent.map((item, idx) => (
                                <tr
                                    key={item.qno}
                                    className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleDetail(item.qno)}
                                >
                                    <td className="py-4 px-2 text-xs text-center">{(page - 1) * size + idx + 1}</td>
                                    <td className="py-4 px-2 text-xs text-center">
                                        <span className={`px-1 py-1 rounded text-white text-xs ${item.status === "완료" ? "bg-yellow-500" : "bg-gray-400"}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-xs truncate" title={item.title}>{item.title}</td>
                                    <td className="py-4 px-2 text-xs text-center">{item.checkPublic ? "-" : "🔒︎"}</td>
                                    <td className="py-4 px-2 text-xs text-center">{item.name}</td>
                                    <td className="py-4 px-2 text-xs text-center">{item.postedAt.substring(0, 16)}</td>
                                    <td className="py-4 px-2 text-xs text-center">{item.modifiedAt ? `${item.modifiedAt.substring(0, 16)}` : ""}</td>
                                    <td className="py-4 px-2 text-xs text-center">{item.viewCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <div className="mt-13">{renderPagination()}</div>
        </div>
    );
};

export default QnaComponent;
