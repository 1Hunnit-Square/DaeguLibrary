import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import QRComponent from "../components/member/QRComponent";
import { useRecoilState } from "recoil";
import RecoilLoginState from '../atoms/loginState';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MemberCardPage = () => {

    const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);
    const navigate = useNavigate();

    useEffect(()=>{
    if(!loginState.mid){
        alert("로그인부터하고와");
        navigate("/");
    }

    },[])

    return(
        <Layout sideOn={false}>
        <SubHeader subTitle="모바일 회원증" mainTitle="기타" />
        <div className = "my-20">
        회원 카드
        <div className = "mt-10 justify-center items-center">
        <QRComponent mid={loginState.mid} />
        </div>
        </div>
        </Layout>
    );
}

export default MemberCardPage;