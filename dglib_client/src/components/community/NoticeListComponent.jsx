import { usePagination } from "../../hooks/usePage";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Button from "../common/Button";
import { getNoticeList } from "../../api/noticeApi";
import TableComponent from "../common/TableComponent";
import { useSearchHandler } from "../../hooks/useSearchHandler";

const NoticeListComponent = () => {
    const [ searchURLParams, setSearchURLParams] = useSearchParams();
    const navigate = useNavigate();


 const { data: noticeData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
        queryKey: ['noticeList', searchURLParams.toString()],
        queryFn: () => {
                            const params = {
                                page: parseInt(searchURLParams.get("page") || "1"),
                                size: parseInt(searchURLParams.get("size") || "10"),
                                sortBy: searchURLParams.get("sortBy") || "postedAt",
                                orderBy: searchURLParams.get("orderBy") || "desc",
                            };
        
                            if (searchURLParams.has("query")) {
                                params.query = searchURLParams.get("query") || "";
                                params.option = searchURLParams.get("option") || "제목";
                            }
                            console.log(params);
                            return getNoticeList(params);
                        }
    });

    


    const { renderPagination } = usePagination(
    noticeData,
    searchURLParams,
    setSearchURLParams,
    isLoading
  );

const { handleSearch } = useSearchHandler({});

const toDate = (dateTime) => {
        return dateTime.substring(0, 10);
    }

     const tableMap = {
            table : {"title":"제목","name":"작성자","postedAt":"작성일","viewCount":"조회수"},
            width : {"title" : "100"},
            trans : { "postedAt": toDate },
            leftKey: ["title"],
            overKey: ["title"],
            lineKey : ["title"],
            noneMsg: "회원 정보가 없습니다."
            }

    const handleDetail = (ano) => {
        navigate(`/community/notice/${ano}`);
    }

    
    return (
    <div className = "p-10">
      <div className="mb-4 flex justify-end">
        <SearchSelectComponent
          options={["제목", "내용", "작성자"]}
          handleSearch={handleSearch}
          input={searchURLParams.get("query") || ""}
          defaultCategory={searchURLParams.get("option") || "제목"}
          selectClassName="w-20 md:w-28"
          dropdownClassName="w-24 md:w-28"
          className="w-full md:w-[50%] mx-end"
          inputClassName="w-full"
          buttonClassName="right-2"
        />
      </div>
        <TableComponent data={noticeData} isLoading={isLoading} handleListClick={handleDetail} tableMap={tableMap} defaultKey={"ano"} />
        
      <div className="flex justify-end mt-4">
        <Button onClick={() => navigate("/community/notice/new")}>글쓰기</Button>
      </div>

      {renderPagination()}
    </div>
    )
}

export default NoticeListComponent;