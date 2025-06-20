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
        <h1 className = "flex text-3xl font-bold mb-10 justify-center">휴대폰 인증</h1>
        <div className = "flex justify-center">
        <Button onClick={handleAuth}>인증하기</Button>
        </div>
    </div>
<PageModal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose} PageMap={pageMap} defaultPage={"phoneAuth"}  />
</Layout>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
);
}

export default AuthPage;