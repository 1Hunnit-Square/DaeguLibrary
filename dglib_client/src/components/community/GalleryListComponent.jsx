import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import Button from "../common/Button";
import { getGalleryList, getGalleryThumbnail } from "../../api/galleryApi";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useMemo } from "react";

const GalleryListComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const navigate = useNavigate();

    const { data: galleryData = { content: [], totalElements: 0 },
        isLoading, error, refetch
    } = useQuery({
        queryKey: ['galleryList', searchURLParams.toString()],
        queryFn: () => {
            const params = {
                page: parseInt(searchURLParams.get("page") || "1"),
                size: parseInt(searchURLParams.get("size") || "12"),
                sortBy: searchURLParams.get("sortBy") || "postedAt",
                orderBy: searchURLParams.get("orderBy") || "desc",
            };

            if (searchURLParams.has("query")) {
                params.query = searchURLParams.get("query") || "";
                params.option = searchURLParams.get("option") || "제목";
            }
            console.log(params);
            return getGalleryList(params);
        }
    });


    const { renderPagination } = usePagination(
        galleryData,
        searchURLParams,
        setSearchURLParams,
        isLoading
    );

                const renderSearchResultCount = useMemo(() => {
                if (!!searchURLParams.get("query") && galleryData?.totalElements !== undefined) {
                  return (
                    <div className="mb-4 text-sm text-gray-600">
                      "{searchURLParams.get("query")}"에 대한 검색 결과 {galleryData.totalElements}건이 있습니다.<br />
                    </div>
                  );
                }
                return null;
              }, [!!searchURLParams.get("query"), galleryData, searchURLParams.get("query")]);

    const { handleSearch } = useSearchHandler({});

    const handleDetail = (gno) => {
        navigate(`/community/gallery/${gno}`);
    };

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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 mt-10">
                {galleryData.content.length > 0 ? (
                    galleryData.content.map((item) => {
                        return (
                            <div
                                key={item.gno}
                                onClick={() => handleDetail(item.gno)}
                                className="cursor-pointer">
                                <div className="
                                    aspect-[4/3]
                                    bg-gray-200
                                    flex items-center justify-center
                                    overflow-hidden
                                    border border-gray-300 rounded-lg
                                    hover:shadow-md transition
                                ">
                                    {item.thumbnailPath ? (
                                        <img
                                            src={getGalleryThumbnail(item.thumbnailPath)}
                                            alt="thumbnail"
                                            className="object-hidden w-full h-full" />
                                    ) : (
                                        <div className="text-2xl">-</div>
                                    )}
                                </div>
                                <div className="mt-3 text-center truncate">{item.title || "{제목}"}</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center text-gray-500 text-xl">등록된 글이 없습니다.</div>
                )}

            </div>

            <div className="mt-4 flex justify-end">
                <Button
                    onClick={() => navigate("/community/gallery/new")}>글쓰기</Button>

            </div>


            {renderPagination()}
        </div>
    );
};

export default GalleryListComponent;
