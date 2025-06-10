import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { getAccessToken } from "../api/kakaoApi";
import Loading from "../routers/Loading";
import { useLogin } from "../hooks/useLogin";
import { useMoveTo } from "../hooks/useMoveTo";

    const KakaoRedirectPage = () => {

    const [searchParams] = useSearchParams();
    const { doLoginKakao } = useLogin();
    const { moveToSaved, moveToPath, moveToReturn } = useMoveTo();

    const authCode = searchParams.get("code");
    const navigate = useNavigate();

    useEffect(() => {
        if(!authCode){
            alert("잘못된 접근입니다.");
            moveToReturn();
        }
        getAccessToken(authCode).then(token =>{

            doLoginKakao(token).then(res => {
                if(res.error){
                console.log(res.error)
                navigate("/signup/kakao", { state : { kakaoToken : token }});
                return;
                }

                console.log(res);
                moveToSaved();

            }).catch(error=>{
                console.error(error);
                alert("로그인에 오류가 있습니다.");
                moveToPath("/login");

            })

        });

        }, [authCode])


    return (
    <>
    <Loading />
    </>
    );
}
export default KakaoRedirectPage;