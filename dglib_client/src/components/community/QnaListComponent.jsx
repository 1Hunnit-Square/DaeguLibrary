import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePage";
import SearchSelectComponent from "../common/SearchSelectComponent";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Button from "../common/Button";
import { useQuery } from "@tanstack/react-query";
import { getQnaList } from "../../api/qnaApi";
import TableComponent from "../common/TableComponent";

const LockIcon = () => <span style={{ color: 'gray' }}>🔒︎</span>;

const StatusBadge = ({ status }) => {
  const badgeStyle = {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "white",
    fontWeight: "bold",
    backgroundColor: status === "완료" ? "#f1b300" : "#999999",
  };
  return <span style={badgeStyle}>{status}</span>;
};

const QnaListComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mid = useRecoilValue(memberIdSelector);

  const queryParams = useMemo(() => ({
    query: searchParams.get("query") || "",
    option: searchParams.get("option") || "제목",
    page: parseInt(searchParams.get("page") || "1", 10)
  }), [searchParams]);

  const isSearched = !!queryParams.query;

  const { data, isLoading } = useQuery({
    queryKey: ["qnalist", queryParams],
    queryFn: () =>
      getQnaList({
        page: queryParams.page,
        size: 10,
        option: queryParams.option,
        query: queryParams.query,
      }),
    keepPreviousData: true,
  });

  const qnaItems = data?.content || [];
  const pageable = data || {};

  const handleSearch = (newQuery, newOption) => {
    const params = new URLSearchParams();
    params.set("query", newQuery);
    params.set("option", newOption);
    params.set("page", "1");
    setSearchParams(params);
  };

  const { renderPagination } = usePagination(
    pageable,
    searchParams,
    setSearchParams,
    isLoading
  );

  const renderSearchResultCount = useMemo(() => {
    if (isSearched && pageable?.totalElements !== undefined) {
      return (
        <div className="mb-4 text-sm text-gray-600">
          "{queryParams.query}"에 대한 검색 결과 {pageable.totalElements}건이 있습니다.<br />
          조회 권한이 없는 글은 목록에서 제외됩니다.
        </div>
      );
    }
    return null;
  }, [isSearched, pageable, queryParams.query]);

  const tableMap = {
    table: {
      status: "처리상황",
      title: "제목",
      checkPublic: "공개여부",
      name: "작성자",
      postedAt: "작성일",
      viewCount: "조회수"
    },
    trans: {
      status: (val) => <StatusBadge status={val} />,
      checkPublic: (val) => val ? "" : <LockIcon />,
      postedAt: (val) => val?.substring(0, 10),
    },
    style: {
      title: "max-w-100 min-w-100",
    },
    overKey: ["title"],
    lineKey: ["title"],
    noneMsg: "등록된 글이 없습니다.",
  };

  const handleDetail = (qno) => {
    navigate(`/community/qna/${qno}`);
  };

  return (
    <div className="p-10">
      <div className="mb-4 flex justify-end">
        <SearchSelectComponent
          options={["제목", "내용", "작성자"]}
          handleSearch={handleSearch}
          input={queryParams.query}
          defaultCategory={queryParams.option}
          selectClassName="w-20 md:w-28"
          dropdownClassName="w-24 md:w-28"
          className="w-full md:w-[50%] mx-end"
          inputClassName="w-full"
          buttonClassName="right-2"
        />
      </div>

      {renderSearchResultCount}

      <TableComponent
        data={pageable}
        isLoading={isLoading}
        handleListClick={handleDetail}
        tableMap={tableMap}
        defaultKey={"qno"}
        indexNum={true}
      />

      <div className="flex justify-end mt-4">
        <Button onClick={() => {
          if (!mid) {
            alert("로그인이 필요합니다.");
            navigate("/login");
          } else {
            navigate("/community/qna/new");
          }
        }}>
          글쓰기
        </Button>
      </div>

      {renderPagination()}
    </div>
  );
};

export default QnaListComponent;
