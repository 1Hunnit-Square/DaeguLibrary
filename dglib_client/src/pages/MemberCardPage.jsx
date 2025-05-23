import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import QRComponent from "../components/member/QRComponent";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../atoms/loginState";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MemberCardPage = () => {

    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();

    useEffect(()=>{
    if(!mid){
        alert("로그인부터하고와");
        navigate("/");
    }

    },[])

    return(
        <Layout sideOn={false}>
        <SubHeader subTitle="모바일 회원증" mainTitle="기타" />
        <div className = "flex mt-10 justify-center">회원 카드</div>
        <div className = "my-10 justify-center items-center">
        <QRComponent mid={mid} />
        </div>
        
        </Layout>
    );
}

export default MemberCardPage;