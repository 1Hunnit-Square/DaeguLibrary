import Layout from "../layouts/Layout"
import { useRecoilValue } from "recoil";
import { useLogin } from "../hooks/useLogin";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect } from "react";
import { memberIdSelector } from "../atoms/loginState";
import Loading from "../routers/Loading";





const LogoutPage = () => {
    const mid = useRecoilValue(memberIdSelector);
    const { doLogout } = useLogin();
    const { moveToPath } = useMoveTo();

    useEffect(()=> {
        if (!mid){
        moveToPath("/");
        } else {
        doLogout();
        alert("로그아웃 되었습니다.");
        moveToPath("/");
        }

    },[]);

    return (
        <Loading text = "로그아웃 중..." />
    )
}

export default LogoutPage;