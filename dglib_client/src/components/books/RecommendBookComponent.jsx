import SelectComponent from "../common/SelectComponent";
import Button from "../common/Button";
import { useMemo } from "react";
import { useSelectHandler } from "../../hooks/useSelectHandler";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookrecoList } from "../../api/bookApi";

const RecommendBookComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { handleSelectChange } = useSelectHandler(searchURLParams, setSearchURLParams);
    const option = useMemo(() => ({"문학": "literature", "철학": "philosophy", "종교": "religion", "역사": "history", "언어": "language", "예술": "art", "사회과학": "social-sciences", "자연과학": "natural-sciences", "기술과학": "technology"}), []);

    const { data: recoBookData = { content: [], totalElements: 0 }, isLoading } = useQuery({
        queryKey: ['recoBookList', searchURLParams.toString()],
        queryFn: () => getBookrecoList(searchURLParams.get("genre") || "literature"),
    });

    console.log(recoBookData)

    return (
        <div>
            <div className="flex border border-[#00893B] mt-8 p-8 max-w-[90%] mx-auto item-center gap-10">
                <p className="my-auto">장르</p>
                <SelectComponent onChange={(value) => handleSelectChange('genre', value)} value={searchURLParams.get("genre") || "literature"} options={option} />
            </div>
        </div>
    )
}
export default RecommendBookComponent;