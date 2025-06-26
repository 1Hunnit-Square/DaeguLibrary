import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import Button from "../common/Button";
import { getEventList, getEventPinnedList } from "../../api/eventApi";
import TableComponent from "../common/TableComponent";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useMemo } from "react";

const EventListComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const navigate = useNavigate();

    const { data: eventData = { content: [], totalElements: 0 }, isLoading, error, refetch } = useQuery({
        queryKey: ['eventList', searchURLParams.toString()],
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
            return getEventList(params);
        }
    });

    const { data: pinnedList } = useQuery({
        queryKey: ['eventPinndeList', searchURLParams.toString()],
        queryFn: () => getEventPinnedList()
    });

    const { renderPagination } = usePagination(
        eventData,
        searchURLParams,
        setSearchURLParams,
        isLoading
    );

        const renderSearchResultCount = useMemo(() => {
        if (!!searchURLParams.get("query") && eventData?.totalElements !== undefined) {
          return (
            <div className="mb-4 text-sm text-gray-600">
              "{searchURLParams.get("query")}"에 대한 검색 결과 {eventData.totalElements}건이 있습니다.<br />
            </div>
          );
        }
        return null;
      }, [!!searchURLParams.get("query"), eventData, searchURLParams.get("query")]);

    const { handleSearch } = useSearchHandler({});

    const toDate = (dateTime) => {
        return dateTime.substring(0, 10);
    }

    const tableMap = {
        table: { "title": "제목", "name": "작성자", "postedAt": "작성일", "viewCount": "조회수" },
        trans: { "postedAt": toDate },
        style: { "title": "max-w-100 min-w-100" },
        leftKey: ["title"],
        overKey: ["title"],
        lineKey: ["title"],
        noneMsg: "등록된 글이 없습니다."
    }

    const handleDetail = (eno) => {
        navigate(`/community/event/${eno}`);
    }

    return (
        <div className="p-4 md:p-10">
            <div className="mb-4 flex justify-end">
                <SearchSelectComponent
                    options={["제목", "내용"]}
                    handleSearch={handleSearch}
                    input={searchURLParams.get("query") || ""}
                    defaultCategory={searchURLParams.get("option") || "제목"}
                    selectClassName="w-20 md:w-28"
                    dropdownClassName="w-24 md:w-28"
                    className="w-full md:w-[50%] ml-auto"
                    inputClassName="w-full"
                    buttonClassName="right-2"
                />
            </div>

            {renderSearchResultCount}
            <TableComponent data={eventData} isLoading={isLoading} handleListClick={handleDetail} tableMap={tableMap} defaultKey={"eno"} pinnedList={pinnedList} />

            <div className="flex justify-end mt-4">
                <Button onClick={() => navigate("/community/event/new")}>글쓰기</Button>
            </div>

            {renderPagination()}
        </div>
    )
}

export default EventListComponent;