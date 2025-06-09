import { useState, useRef, useEffect, useMemo } from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-tooltip/dist/react-tooltip.css';
import QuillComponent from "../common/QuillComponent";
import { modNews, getNewsDetail } from "../../api/newsApi";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../routers/Loading";
import { imgReplace } from "../../util/commonUtil";

const NewsModComponent = () => {
    const navigate = useNavigate();
    const { moveToLogin } = useMoveTo();
    const mid = useRecoilValue(memberIdSelector);

    const { nno } = useParams();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['newsDetail', nno],
        queryFn: () => getNewsDetail(nno),
        refetchOnWindowFocus: false,
    });

    const dataMap = useMemo(() => ({ data: { ...data, content: imgReplace(data?.content) }, fileDTOName: "fileDTO" }), [data]);

    const sendParams = (paramData) => {

        console.log(paramData);


        modNews(nno, paramData).then(res => {
            alert("글을 수정하였습니다.");
            navigate("/community/news");

        }).catch(error => {
            alert("글 수정에 실패했습니다.");
            console.error(error);
        })
    }

    const onBack = () => {
        navigate(-1);
    }


    useEffect(() => {

        if (!mid) {
            moveToLogin();

        }


    }, []);

    return (
        <div className="flex flex-col justify-center bt-5 mb-10">
            {isLoading && <Loading />}
            {mid && data && <QuillComponent
                onParams={sendParams}
                onBack={onBack}
                useTitle={true}
                usePinned={true}
                usePublic={false}
                upload={["image"]}
            />
            }
        </div>
    );
}

export default NewsModComponent;

