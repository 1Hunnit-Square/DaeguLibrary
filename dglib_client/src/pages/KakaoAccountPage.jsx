import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import Modal from "../components/common/Modal";
import KakaoAccountComponent from "../components/member/KakaoAccountComponent";

const KakaoAccountPage = () => {

const [ isOpen, setIsOpen ] = useState(false);
const location = useLocation();
const navigate = useNavigate();
const { kakaoToken } = location.state || {};

    useEffect(()=>{
        if(!kakaoToken){
            alert("잘못된 접근 입니다.");
            navigate("/");
        }



    },[])


        return(
        <Layout sideOn={false}>
        <SubHeader subTitle="회원가입" mainTitle="기타" />
        
        <div className = "my-20">
        <div className = "font-bold text-xl text-center mb-5">
         현재 카카오 계정과 연동된 도서관 ID가 존재하지 않습니다.
         </div>
         <div className = "flex justify-center items-center gap-8 p-8">
       <div className="w-64 h-64 bg-blue-400 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-blue-500 text-white cursor-pointer transition"
        onClick = {() => setIsOpen(true)}>
        기존 계정과 연동
      </div>
      <div className="w-64 h-64 bg-green-400 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-green-500 text-white cursor-pointer transition"
       onClick = {()=> navigate("/signup",{state : { kakaoToken }})}>
        신규 회원가입
      </div>
      </div>
        </div>
        <Modal isOpen={isOpen} title={"카카오 계정 연동"} onClose={(()=> setIsOpen(false))}><KakaoAccountComponent onClose={()=> setIsOpen(false)} /></Modal>
        </Layout> 
        );
  }

export default KakaoAccountPage;