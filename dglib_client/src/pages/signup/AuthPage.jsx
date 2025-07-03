import Button from "../../components/common/Button";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import PageModal from "../../components/common/PageModal";
import { useState, useCallback, useEffect, useRef } from "react";
import PhoneAuthComponent from "../../components/member/PhoneAuthComponent";
import PhoneCheckComponent from "../../components/member/PhoneCheckComponent";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const AuthPage = () => {
const [isOpen, setIsOpen] = useState(false);
const [ searchURLParams, setSearchURLParams] = useSearchParams();
const navigate  = useNavigate();
const location = useLocation();
const { kakaoToken } = location.state || {};
const contentRef = useRef(null);
const reactToPrintFn = useReactToPrint({ contentRef });

const handleAuth = useCallback(() => {
setIsOpen(true);
},[])

const handleClose = useCallback(() => {
setIsOpen(false);
},[]);


useEffect(() => {
if(searchURLParams.get("account") == "kakao"){
  if(kakaoToken){
    return;
    } else{
    alert("토큰이 존재하지않습니다. 카카오 인증을 다시 시도해주세요");
    navigate("/login",{replace : true});
  }

}
},[searchURLParams.toString()])


const handleSuccess = (pageData) => {
const prev = location.state || {};
const urlParam = searchURLParams.get("account") == "kakao" ? "?account=kakao" : ""
navigate(`/signup/join${urlParam}`, { state: { ...prev ,...pageData} });
}

const pageMap = {
    phoneAuth : { component : PhoneAuthComponent },
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess, phoneCheck : false } }
}

return (
<Layout sideOn={false}>
    <SubHeader subTitle="회원가입" mainTitle="기타" print={reactToPrintFn} />
    <div className="p-6 max-w-3xl mx-auto mb-10" ref={contentRef}>
                 <div className = "border border-gray-100 shadow rounded-xl w-xs mx-auto py-10 my-7">
                <h1 className = "flex text-3xl font-bold my-5 justify-center">휴대폰 인증</h1>
                <img src="/phoneAuth.png" className="w-25 mx-auto my-7 block" />
                <div className = "flex flex-col items-center justify-center gap-7">
                <div className="text-sm text-gray-700 text-center">SMS 문자 전송을 통한<br /> 본인 인증 서비스입니다.</div>
                <Button onClick={handleAuth}>인증하기</Button>
                </div>
                </div>
    </div>
<PageModal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose} PageMap={pageMap} defaultPage={"phoneAuth"}  />
</Layout>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
);
}

export default AuthPage;