import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { getAccessToken } from "../api/kakaoApi";
import Loading from "../routers/Loading";

    const KakaoRedirectPage = () => {

    const [searchParams] = useSearchParams();
    const authCode = searchParams.get("code");
    const navigate = useNavigate();

    useEffect(() => {
        if(!authCode){
            alert("잘못된 접근입니다.");
            navigate(-1, {replace: true});
        }
        getAccessToken(authCode).then(data => {
        console.log(data)
        })
        }, [authCode])


    return (
    <>
    <Loading />
    </>
    );
}
export default KakaoRedirectPage;