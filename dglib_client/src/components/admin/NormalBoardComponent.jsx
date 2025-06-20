import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminNoticeList, getAdminNewsList } from "../../api/adminApi";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import { usePagination } from "../../hooks/usePage";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";

const NormalBoardComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dateRange, handleDateChange } = useDateRangeHandler();

  const [boardType, setBoardType] = useState("notice");
  const boardOptions = { notice: "공지사항", news: "보도자료" };

  const boardMap = {
    notice: {
      label: "공지사항",
      api: getAdminNoticeList,
      columns: [
        { key: "ano", label: "글번호", align: "center", width: "7%" },
        { key: "title", label: "제목", align: "left", width: "35%" },
        { key: "writerId", label: "작성자", align: "center", width: "13%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "viewCount", label: "조회수", align: "center", width: "8%" },
      ]
    },
    news: {
      label: "보도자료",
      api: getAdminNewsList,
      columns: [
        { key: "nno", label: "글번호", align: "center", width: "7%" },
        { key: "title", label: "제목", align: "left", width: "35%" },
        { key: "writerId", label: "작성자", align: "center", width: "13%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "viewCount", label: "조회수", align: "center", width: "8%" },
      ]
    }
  };

  const currentBoard = boardMap[boardType];

  const searchFieldMap = { "회원 ID": "id", "작성자": "name", "제목": "title" };
  const searchOptions = Object.keys(searchFieldMap);
  const sortOptions = { 최신순: "postedAt,desc", 오래된순: "postedAt,asc" };
  const sizeOptions = { "10개씩": 10, "20개씩": 20 };

  const today = new Date();
  const aMonthAgo = new Date(today);
  aMonthAgo.setDate(today.getDate() - 30);
  const format = (d) => d.toLocaleDateString("sv-SE");

  const option = searchParams.get("option") || "id";
  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const sort = searchParams.get("sort") || "postedAt,desc";
  const startDate = searchParams.get("start") || format(aMonthAgo);
  const endDate = searchParams.get("end") || format(today);

  const defaultCategory = useMemo(() => {
    const entry = Object.entries(searchFieldMap).find(([_, val]) => val === option);
    return entry ? entry[0] : "회원 ID";
  }, [option]);

  const { data = { content: [], totalElements: 0, totalPages: 1, pageable: { pageNumber: 0 } }, isLoading } = useQuery({
    queryKey: [boardType, searchParams.toString()],
    queryFn: () => {
      const params = {
        page: page - 1,
        size,
        sort,
        start: startDate,
        end: endDate,
      };
      if (query.trim()) {
        params.searchType = option;
        params.searchKeyword = query.trim();
      }
      return currentBoard.api(params);
    },
  });

  const paginatedContent = data.content;

  const paginationData = {
    pageable: data.pageable,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
  };

  const { renderPagination } = usePagination(paginationData, searchParams, setSearchParams, isLoading);

  const handleSearch = (newQuery, newOption) => {
    const p = new URLSearchParams(searchParams);
    p.set("query", newQuery);
    p.set("option", searchFieldMap[newOption]);
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

  const handleDateChangeWrapper = (e) => {
    handleDateChange(e);
    const p = new URLSearchParams(searchParams);
    p.set(e.target.name, e.target.value);
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleDetail = (id) => {
    navigate(`/admin/${boardType}/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-6">게시판 관리</h1>

      <div className="flex justify-end mb-4">
        <SelectComponent value={boardType} options={boardOptions} onChange={setBoardType} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-center flex-wrap gap-4 bg-gray-100 p-4 rounded">
        <SearchSelectComponent
          options={searchOptions}
          defaultCategory={defaultCategory}
          input={query}
          handleSearch={handleSearch}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">등록일</span>
          <input type="date" name="start" value={startDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
          <span className="mx-1">-</span>
          <input type="date" name="end" value={endDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
        </div>
      </div>

      <div className="flex justify-end items-center mt-4">
        <SelectComponent value={sort} options={sortOptions} onChange={handleSortChange} />
        <SelectComponent value={size} options={sizeOptions} onChange={handleSizeChange} />
      </div>

      <div className="shadow-md rounded-lg overflow-x-auto mt-4">
        <table className="w-full bg-white">
          <colgroup>
            <col style={{ width: '5%' }} />
            {currentBoard.columns.map((col, idx) => (
              <col key={idx} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="py-2 px-1 text-sm">번호</th>
              {currentBoard.columns.map((col, idx) => (
                <th key={idx} className={`py-2 px-1 text-sm text-${col.align}`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedContent.length === 0 ? (
              <tr>
                <td colSpan={currentBoard.columns.length + 1} className="py-10 text-center text-gray-500">등록된 글이 없습니다.</td>
              </tr>
            ) : (
              paginatedContent.map((item, idx) => (
                <tr
                  key={item.ano || item.nno || idx}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDetail(item.ano || item.nno)}
                >
                  <td className="py-3 px-1 text-sm text-center">{data.pageable.pageNumber * size + idx + 1}</td>
                  {currentBoard.columns.map((col, i) => (
                    <td key={i} className={`py-3 px-1 text-sm text-${col.align}`}>{item[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">{renderPagination()}</div>
    </div>
  );
};

export default NormalBoardComponent;
