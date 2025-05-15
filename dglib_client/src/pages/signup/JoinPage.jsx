import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";

const JoinPage = () => {

const location = useLocation();
const navigate = useNavigate();
const { phone } = location.state || {};

useEffect(()=>{
if(!phone){
    alert("비정상적인 접근입니다.");
    navigate("/signup");
    }

},[]);


return(
<Layout sideOn={false}>
<SubHeader subTitle="회원가입" mainTitle="기타" />
회원가입
<div>
<input type="text" className = "border rounded" />
<input value ={phone} className="border rounded" readOnly />
</div>
</Layout> 
);

}


export default JoinPage; 