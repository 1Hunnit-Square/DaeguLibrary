import { getEbookList } from "../../api/adminApi";
import { useMemo, useState, useEffect } from "react";
import { usePagination } from "../../hooks/usePage";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import SearchSelectComponent from "../common/SearchSelectComponent";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";
import { useSearchHandler } from "../../hooks/useSearchHandler";
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import EbookDetailComponent from "./EbookDetailComponent";



const EbookListComponent = () => {
    const options = ["도서명", "저자", "ISBN"]
    const sortByOption = useMemo(() => ({"등록일순": "ebookId"}), []);
    const orderByOption = useMemo(() => ({"오름차순": "asc", "내림차순": "desc"}), []);
    const sizeOption = useMemo(() => ({"10개씩": "10", "50개씩": "50", "100개씩": "100"}), []);
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ detail, setDetail ] = useState(null);

    useEffect(() => {
            if (isModalOpen) {
              document.body.style.overflow = 'hidden';
            } else {
              document.body.style.overflow = '';
            }
            return () => {
              document.body.style.overflow = '';
            };
          }, [isModalOpen]);

    const { data: ebookData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['ebookList', searchURLParams.toString()],
        queryFn: () => {
                    const params = {
                        page: parseInt(searchURLParams.get("page") || "1"),
                        size: parseInt(searchURLParams.get("size") || "10"),
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        sortBy: searchURLParams.get("sortBy") || "ebookId",
                        orderBy: searchURLParams.get("orderBy") || "desc",
                    };

                    if (searchURLParams.has("query")) {
                        params.query = searchURLParams.get("query")
                        params.option = searchURLParams.get("option")
                    }

                    return getEbookList(params);
                },
    });
    const ebookList = useMemo(() => ebookData.content, [ebookData.content]);
    console.log(ebookList);
    const { handleSearch } = useSearchHandler({tab: 'ebooklist', dateRange});

    const handleModalOpen = (item) => {
        setDetail(item);
        setIsModalOpen(true);
    };

    const { renderPagination } = usePagination(ebookData, searchURLParams, setSearchURLParams, isLoading);


    return (
        <div className="container mx-auto px-4 py-8 w-full">
             {isLoading && (
                <Loading text="목록 갱신중.."/>
            )}
            <h1 className="text-3xl font-bold mb-8 text-center text-[#00893B]">EBOOK 목록</h1>
            <div className="flex flex-col flex-wrap md:flex-row items-center justify-center mb-10 rounded-xl bg-gray-100 shadow p-4 min-h-30 gap-10">
                    <SearchSelectComponent options={options} defaultCategory={searchURLParams.get("option")} selectClassName="mr-2 md:mr-5"
                        dropdownClassName="w-24 md:w-32"
                        className="w-full md:w-[40%]"
                        inputClassName="w-full bg-white"
                        buttonClassName="right-2 top-5"
                        input={searchURLParams.get("query") || ""}
                        handleSearch={handleSearch} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">등록일</span>
                            <input type="date" value={dateRange.startDate} name="startDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                            <span className="mx-4">-</span>
                            <input type="date" value={dateRange.endDate} name="endDate" onChange={handleDateChange} className="w-full border bg-white rounded-md p-2" />
                        </div>
                    </div>
            </div>
            <div className="flex justify-end item-center mb-5 gap-3">
                <SelectComponent onChange={(value) => handleSelectChange('sortBy', value)}  value={searchURLParams.get("sortBy") || "ebookId"}  options={sortByOption} />
                <SelectComponent onChange={(value) => handleSelectChange('orderBy', value)}  value={searchURLParams.get("orderBy") || "desc"}  options={orderByOption}/>
                <SelectComponent onChange={(value) => handleSelectChange('size', value)}  value={searchURLParams.get("size") || "10"}    options={sizeOption} />
            </div>
            <div className="shadow-md rounded-lg overflow-x-auto">
                <table className="w-full bg-white table-fixed">
                    <thead className="bg-[#00893B] text-white">
                        <tr>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">도서명</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">저자</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">출판사</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">ISBN</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">출판일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">등록일</th>
                            <th className="py-3 px-6 text-center text-xs font-semibold uppercase">설명</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {!isLoading && ebookList.length === 0  ? (
                            <tr>
                                <td colSpan="7" className="py-10 px-6 text-center text-gray-500 text-xl">
                                    EBOOK이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            ebookList.map((item, index) => {
                                const today = new Date();
                                const dueDate = new Date(item.dueDate);
                                today.setHours(0, 0, 0, 0);
                                dueDate.setHours(0, 0, 0, 0);
                                return (
                                    <tr key={index} onClick={() => handleModalOpen(item)} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 hover:cursor-pointer`}>
                                        <td className="py-4 px-6 text-center text-xs">{item.ebookTitle}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{item.ebookAuthor}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{item.ebookPublisher}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{item.ebookIsbn}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.ebookPubDate}</td>
                                        <td className="py-4 px-6 text-center text-xs whitespace-nowrap">{item.ebookRegDate}</td>
                                        <td className="py-4 px-6 text-center text-xs max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">{item.ebookDescription}</td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
             {isModalOpen && <EbookDetailComponent setIsModalOpen={setIsModalOpen} eBook={detail}  />}
            {renderPagination()}
        </div>
    );
}

export default EbookListComponent;