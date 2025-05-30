import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePage";
import SearchSelectComponent from "../common/SearchSelectComponent";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Button from "../common/Button";
import { useQuery } from "@tanstack/react-query";
import { getQnaList } from "../../api/qnaApi";
import Loading from "../../routers/Loading";
import useBoardListNumber from "../../hooks/useBoardListNumber";


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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["qnalist", queryParams],
    queryFn: () =>
      getQnaList({
        page: queryParams.page,
        size: 10,
        option: queryParams.option,
        query: queryParams.query,
        requesterMid: mid,
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
          검색 시 조회 권한이 없는 글은 보이지 않습니다.
        </div>
      );
    }
    return null;
  }, [isSearched, pageable, queryParams.query]);

  const getBoardListNumber = useBoardListNumber(pageable.totalElements || 0, queryParams.page, 10);

  return (
    <div style={{ padding: "20px" }}>
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

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        tableLayout: "fixed"
      }}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "35%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "2px solid #00893B", borderTop: "2px solid #00893B" }}>
            <th style={{ padding: "10px" }}>순번</th>
            <th style={{ padding: "10px" }}>처리상황</th>
            <th style={{ padding: "10px" }}>제목</th>
            <th style={{ padding: "10px" }}>공개여부</th>
            <th style={{ padding: "10px" }}>작성자</th>
            <th style={{ padding: "10px" }}>작성일</th>
            <th style={{ padding: "10px" }}>조회수</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}><Loading /></td>
            </tr>
          ) : qnaItems.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                등록된 글이 없습니다.
              </td>
            </tr>
          ) : (
            qnaItems.map((item, index) => (
              <tr key={item.qno} style={{ borderBottom: "1px solid #ddd", textAlign: "center" }}>
                <td>{getBoardListNumber(index)}</td>
                <td><StatusBadge status={item.status} /></td>
                <td
                  onClick={() => navigate(`/community/qna/${item.qno}`)}
                  style={{
                    textAlign: "left",
                    padding: "12px 8px",
                    paddingLeft: "20px",
                    cursor: "pointer"
                  }}
                  className="hover:underline"
                >
                  {item.title}
                </td>
                <td>{item.checkPublic ? "" : <LockIcon />}</td>
                <td>{item.name}</td>
                <td>{item.postedAt?.substring(0, 10)}</td>
                <td>{item.viewCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <Button onClick={() => {
          if (!mid) {
            alert("로그인이 필요합니다.");
            navigate("/login");
          } else {
            navigate("/community/qna/new")
          }
        }
        }>
          글쓰기
        </Button>
      </div>

      {renderPagination()}
    </div>
  );
};

export default QnaListComponent;
