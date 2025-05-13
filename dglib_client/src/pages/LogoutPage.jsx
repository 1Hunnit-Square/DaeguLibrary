import Layout from "../layouts"
import { useRecoilState } from "recoil";
import RecoilLoginState from '../atoms/loginState';
import { useLogin } from "../hooks/useLogin";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect } from "react";






const LogoutPage = () => {
    const { doLogout } = useLogin();
    const { moveToPath } = useMoveTo();

    useEffect(()=> {
    doLogout();
    alert("로그아웃 완료");
    moveToPath("/");

    },[]);

    return (
        <>
        Logout...
        </>  
    )
}

export default LogoutPage;