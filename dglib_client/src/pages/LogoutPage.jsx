import Layout from "../layouts/Layout"
import { useRecoilState } from "recoil";
import RecoilLoginState from '../atoms/loginState';
import { useLogin } from "../hooks/useLogin";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect } from "react";






const LogoutPage = () => {
    const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);
    const { doLogout } = useLogin();
    const { moveToPath } = useMoveTo();

    useEffect(()=> {
        if (!loginState.mid){
        moveToPath("/");
        } else {
        doLogout();
        alert("로그아웃 완료");
        moveToPath("/");
        }

    },[]);

    return (
        <>
        Logout...
        </>  
    )
}

export default LogoutPage;