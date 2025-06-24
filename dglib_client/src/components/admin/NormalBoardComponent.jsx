import Button from "../common/Button";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBoardList, hideBoards, deleteBoards } from "../../api/adminApi";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import { usePagination } from "../../hooks/usePage";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useItemSelection } from "../../hooks/useItemSelection";

const hiddenOptions = { 숨김: "hide", 해제: "unhide" };

const NormalBoardComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleDateChange } = useDateRangeHandler();
  const [hiddenAction, setHiddenAction] = useState("hide");

  const boardMap = {
    notice: {
      label: "공지사항",
      api: (params) => getBoardList({ ...params, boardType: "notice" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "pinned", label: "", align: "center", width: "2%" },
        { key: "title", label: "제목", align: "center", width: "40%" },
        { key: "writerId", label: "작성자", align: "center", width: "12%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "5%" },
        { key: "viewCount", label: "조회수", align: "center", width: "5%" },
      ]
    },
    news: {
      label: "보도자료",
      api: (params) => getBoardList({ ...params, boardType: "news" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "pinned", label: "", align: "center", width: "2%" },
        { key: "title", label: "제목", align: "center", width: "40%" },
        { key: "writerId", label: "작성자", align: "center", width: "12%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "5%" },
        { key: "viewCount", label: "조회수", align: "center", width: "5%" },
      ]
    },
    event: {
      label: "새소식",
      api: (params) => getBoardList({ ...params, boardType: "event" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "pinned", label: "", align: "center", width: "2%" },
        { key: "title", label: "제목", align: "center", width: "40%" },
        { key: "writerId", label: "작성자", align: "center", width: "12%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "5%" },
        { key: "viewCount", label: "조회수", align: "center", width: "5%" },
      ]
    },
    gallery: {
      label: "갤러리",
      api: (params) => getBoardList({ ...params, boardType: "gallery" }),
      columns: [
        { key: "no", label: "글번호", align: "center", width: "7%" },
        { key: "pinned", label: "", align: "center", width: "2%" },
        { key: "title", label: "제목", align: "center", width: "40%" },
        { key: "writerId", label: "작성자", align: "center", width: "12%" },
        { key: "postedAt", label: "작성일", align: "center", width: "12%" },
        { key: "modifiedAt", label: "수정일", align: "center", width: "12%" },
        { key: "hidden", label: "숨김", align: "center", width: "5%" },
        { key: "viewCount", label: "조회수", align: "center", width: "5%" },
      ]
    }
  };

  const boardTypeFromURL = searchParams.get("boardType");
  const initialBoardType = boardTypeFromURL && boardTypeFromURL in boardMap ? boardTypeFromURL : "notice";
  const [boardType, setBoardType] = useState(initialBoardType);

  useEffect(() => {
    const fromURL = searchParams.get("boardType");
    if (fromURL && fromURL in boardMap) {
      setBoardType(fromURL);
    }
  }, [searchParams]);

  const currentBoard = boardMap[boardType];
  const searchFieldMap = { "회원 ID": "id", "작성자": "name", "제목": "title" };
  const boardOptions = { 공지사항: "notice", 보도자료: "news", 새소식: "event", 갤러리: "gallery" };
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

  const startDate = searchParams.get("startDate") || format(aMonthAgo);
  const endDate = searchParams.get("endDate") || format(today);

  useEffect(() => {
    if (!searchParams.get("startDate") || !searchParams.get("endDate")) {
      const p = new URLSearchParams(searchParams);
      p.set("startDate", format(aMonthAgo));
      p.set("endDate", format(today));
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
        startDate,
        endDate,
      };
      if (query.trim()) {
        params.searchType = option;
        params.searchKeyword = query.trim();
      }
      if (isHiddenOnly) {
        params.isHidden = true;
      }
      return currentBoard.api(params);
    }
  });

  const paginatedContent = data.content;

  const {
    selectedItems,
    isAllSelected,
    handleSelectItem,
    handleSelectAll,
  } = useItemSelection(paginatedContent, "no");

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

  const handleHiddenAction = async () => {
    const ids = Array.from(selectedItems);
    if (!ids.length) return;
    const isHidden = hiddenAction === "hide";
    await hideBoards(boardType, ids, isHidden);
    navigate(0);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedItems);
    if (!ids.length) return;
    await deleteBoards(boardType, ids);
    navigate(0);
  };

  const handleSearch = (newQuery, newOption) => {
    const p = new URLSearchParams(searchParams);
    p.set("query", newQuery);
    p.set("option", searchFieldMap[newOption]);
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleBoardTypeChange = (value) => {
    const p = new URLSearchParams(searchParams);
    p.set("boardType", value);
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
    const p = new URLSearchParams(searchParams);
    if (e.target.name === "start") {
      p.set("startDate", e.target.value);
      p.delete("start");
    } else if (e.target.name === "end") {
      p.set("endDate", e.target.value);
      p.delete("end");
    }

    p.set("page", "1");
    setSearchParams(p);
  };

  const handleDetail = (id) => {
    navigate(`/community/${boardType}/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">게시판 관리</h1>

      <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 gap-5 rounded-xl bg-gray-300 p-4 min-h-30">
        <SearchSelectComponent
          options={Object.keys(searchFieldMap)}
          defaultCategory={defaultCategory}
          className="w-full md:w-[50%]"
          inputClassName="w-full bg-white"
          buttonClassName="right-2 top-5"
          dropdownClassName="w-24 md:w-32"
          input={query}
          handleSearch={handleSearch}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">등록일</span>
            <input type="date" name="start" value={startDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
            <span className="mx-1">-</span>
            <input type="date" name="end" value={endDate} onChange={handleDateChangeWrapper} className="border bg-white rounded-md p-2" />
          </div>

          <div className="w-full flex mr-80 items-center gap-4 mt-1">
            <label className="flex items-center gap-1 text-sm font-medium">
              <input
                type="radio"
                name="hiddenFilter"
                className="w-4 h-4 accent-green-700"
                value="all"
                checked={!isHiddenOnly}
                onChange={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete("hidden"); // 전체 보기
                  p.set("page", "1");
                  setSearchParams(p);
                }}
              />
              전체
            </label>

            <label className="flex items-center gap-1 text-sm font-medium">
              <input
                type="radio"
                name="hiddenFilter"
                className="w-4 h-4 accent-green-700"
                value="hidden"
                checked={isHiddenOnly}
                onChange={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("hidden", "true"); // 숨김만 보기
                  p.set("page", "1");
                  setSearchParams(p);
                }}
              />
              숨긴 글
            </label>
          </div>


        </div>


      </div>




      <div className="flex justify-between items-center mt-6 gap-2">
        <div />
        <div className="flex items-center gap-2">
          <SelectComponent value={boardType} options={boardOptions} onChange={handleBoardTypeChange} />
          <SelectComponent value={sort} options={sortOptions} onChange={handleSortChange} />
          <SelectComponent value={size} options={sizeOptions} onChange={handleSizeChange} />
        </div>
      </div>

      <div className="shadow-md rounded-lg overflow-x-auto mt-4">
        <table className="w-full bg-white table-auto">
          <colgroup>
            <col style={{ width: '5%' }} />
            {currentBoard.columns.slice(1).map((col, idx) => (
              <col key={idx} />
            ))}
          </colgroup>
          <thead className="bg-[#00893B] text-white">
            <tr>
              <th className="py-3 px-2 text-center text-xs font-semibold uppercase">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              {currentBoard.columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-2 text-xs font-semibold uppercase text-${col.align}`}>
                  {col.label}
                </th>
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
                >
                  <td className="py-4 px-2 text-xs text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.no)}
                      onChange={(e) => handleSelectItem(e, item.no)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {currentBoard.columns.map((col, i) => {
                    let value = item[col.key];
                    if (col.key === "writerId" && item.name) {
                      value = `${item.name}(${item[col.key]})`;
                    }
                    if (col.key === "hidden") {
                      value = item[col.key] ? "Y" : "-";
                    }
                    if (col.key === "pinned") {
                      value = item[col.key] ? "📌" : "";
                    }
                    if (col.key === "postedAt" || col.key === "modifiedAt") {
                      value = typeof value === "string" ? value.substring(0, 16) : value;
                    }
                    return (
                      <td
                        key={i}
                        className={`py-4 px-2 text-xs text-${col.align}`}
                        title={typeof value === "string" ? value : ""}
                        onClick={() => handleDetail(item.no)}
                      >
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
      <div className="flex mt-5 justify-end items-center gap-2">
        <SelectComponent value={hiddenAction} options={hiddenOptions} onChange={setHiddenAction} />
        <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded" onClick={handleHiddenAction}>변경</Button>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded" onClick={handleDeleteSelected}>삭제</Button>
      </div>

      <div className="mt-6">{renderPagination()}</div>
    </div>
  );
};

export default NormalBoardComponent;
