
import Button from "../common/Button";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBoardList } from "../../api/adminApi";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import { usePagination } from "../../hooks/usePage";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";

const NormalBoardComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleDateChange } = useDateRangeHandler();

  const boardMap = {
    notice: {
      label: "공지사항",
      api: (params) => getBoardList({ ...params, boardType: "notice" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "title", label: "제목", align: "center", width: "35%" },
        { key: "writerId", label: "작성자", align: "center", width: "13%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "12%" },
        { key: "viewCount", label: "조회수", align: "center", width: "8%" },
      ]
    },
    news: {
      label: "보도자료",
      api: (params) => getBoardList({ ...params, boardType: "news" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "title", label: "제목", align: "center", width: "35%" },
        { key: "writerId", label: "작성자", align: "center", width: "13%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "12%" },
        { key: "viewCount", label: "조회수", align: "center", width: "8%" },
      ]
    }
  };

  const boardTypeFromURL = searchParams.get("boardType");
  const initialBoardType = boardTypeFromURL && boardTypeFromURL in boardMap ? boardTypeFromURL : "notice";
  const [boardType, setBoardType] = useState(initialBoardType);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fromURL = searchParams.get("boardType");
    if (fromURL && fromURL in boardMap) {
      setBoardType(fromURL);
    }
  }, [searchParams]);

  const currentBoard = boardMap[boardType];

  const handleBoardTypeChange = (value) => {
    const p = new URLSearchParams(searchParams);
    p.set("boardType", value);
    p.set("page", "1");
    setSearchParams(p);
  };

  const searchFieldMap = { "회원 ID": "id", "작성자": "name", "제목": "title" };
  const boardOptions = { 공지사항: "notice", 보도자료: "news" };
  const sortOptions = { 최신순: "postedAt,desc", 오래된순: "postedAt,asc" };
  const sizeOptions = { "10개씩": 10, "20개씩": 20 };
  const isHiddenOnly = searchParams.get("hidden") === "true";

  const option = searchParams.get("option") || "id";
  const query = searchParams.get("query") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);
  const sort = searchParams.get("sort") || "postedAt,desc";

  const today = new Date();
  const aMonthAgo = new Date(today);
  aMonthAgo.setDate(today.getDate() - 30);
  const format = (d) => d.toLocaleDateString("sv-SE");

  const startDate = searchParams.get("start") || format(aMonthAgo);
  const endDate = searchParams.get("end") || format(today);

  useEffect(() => {
    if (!searchParams.get("start") || !searchParams.get("end")) {
      const p = new URLSearchParams(searchParams);
      p.set("start", format(aMonthAgo));
      p.set("end", format(today));
      setSearchParams(p);
    }
  }, []);

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
      if (isHiddenOnly) {
        params.isHidden = true;
      }
      return currentBoard.api(params);
    },
  });

  const paginatedContent = data.content;

  const { renderPagination } = usePagination(
    {
      pageable: data.pageable,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    },
    searchParams,
    setSearchParams,
    isLoading
  );

  const handleHideSelected = () => {
    console.log("숨김 처리할 ID 목록:", selectedIds);
    // 👉 여기에 실제 API 연동 로직 추가 예정
  };

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
    navigate(`/community/${boardType}/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">게시판 관리</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-center flex-wrap gap-4 bg-gray-100 shadow-md p-4 rounded">

        <SearchSelectComponent
          options={Object.keys(searchFieldMap)}
          defaultCategory={defaultCategory}
          input={query}
          handleSearch={handleSearch}
          className="w-full md:w-auto"
          inputClassName="bg-white"
          buttonClassName="right-2 top-5"
          dropdownClassName="w-full md:w-32"
        />
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">등록일</span>
            <input type="date" name="start" value={startDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
            <span className="mx-1">-</span>
            <input type="date" name="end" value={endDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
          </div>

          <label className="flex text-sm font-medium">
            <input
              type="checkbox"
              checked={isHiddenOnly}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                if (e.target.checked) {
                  p.set("hidden", "true");
                } else {
                  p.delete("hidden");
                }
                p.set("page", "1");
                setSearchParams(p);
              }}
              className="mr-1"
            />
            숨김 글만 보기
          </label>
        </div>

      </div>


      <div className="flex justify-end items-center mt-6 gap-2">
        <SelectComponent value={boardType} options={boardOptions} onChange={handleBoardTypeChange} />
        <SelectComponent value={sort} options={sortOptions} onChange={handleSortChange} />
        <SelectComponent value={size} options={sizeOptions} onChange={handleSizeChange} />
      </div>

      <div className="shadow-md rounded-lg overflow-x-auto mt-4">
        <table className="w-full bg-white table-fixed">
          <colgroup>
            <col style={{ width: '5%' }} />
            {currentBoard.columns.map((col, idx) => (
              <col key={idx} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className="bg-[#00893B] text-white">
            <tr>
              <th className="py-3 px-2 text-center text-xs font-semibold uppercase">번호</th>
              {currentBoard.columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-2 text-xs font-semibold uppercase text-${col.align}`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {paginatedContent.length === 0 ? (
              <tr>
                <td colSpan={currentBoard.columns.length + 1} className="py-10 text-center text-gray-500 text-xl">
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedContent.map((item, idx) => (
                <tr
                  key={item.no}
                  className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleDetail(item.no)}
                >
                  <td className="py-4 px-2 text-xs text-center">{data.pageable.pageNumber * size + idx + 1}</td>
                  {currentBoard.columns.map((col, i) => {
                    let value = item[col.key];
                    if (col.key === "writerId" && item.name) {
                      value = `${item.name}(${item[col.key]})`;
                    }
                    if (col.key === "hidden") {
                      value = item[col.key] ? "Y" : "-";
                    }
                    if (col.key === "postedAt" || col.key === "modifiedAt") {
                      value = typeof value === "string" ? value.substring(0, 16) : value;
                    }
                    return (
                      <td key={i} className={`py-4 px-2 text-xs text-${col.align}`} title={typeof value === "string" ? value : ""}>
                        {value}
                      </td>
                    );
                  })}
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
