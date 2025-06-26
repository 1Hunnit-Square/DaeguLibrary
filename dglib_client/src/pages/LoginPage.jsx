import Layout from "../layouts/Layout"
import { useRecoilValue } from "recoil";
import LoginComponent from "../components/member/LoginComponent";
import { useMoveTo } from "../hooks/useMoveTo";
import { useEffect, useRef } from "react";
import SubHeader from "../layouts/SubHeader";
import { memberIdSelector } from "../atoms/loginState";
import { useReactToPrint } from "react-to-print";



const LoginPage = () => {
    const mid = useRecoilValue(memberIdSelector);
    const { moveToPath } = useMoveTo();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(()=>{
    if (mid){
        moveToPath("/");
    }
    },[]);
  
    
    return (
        <Layout sideOn={false}>
        <SubHeader subTitle="로그인" mainTitle="기타" print={reactToPrintFn} />
        <div className="mx-auto text-center border border-gray-300 rounded-lg sm:w-100 my-10 w-80" ref={contentRef}>
        <div className="mt-10 mb-3">
        대구 도서관에 오신 것을 환영합니다.
        </div>
        <h1 className="text-4xl mb-3 font-bold text-gray-900">대구 도서관</h1>
        <h2 className="text-2xl font-semibold text-gray-700">회원 로그인</h2>
             <LoginComponent />
        </div>
        </Layout>
    
        );
}

export default LoginPage;