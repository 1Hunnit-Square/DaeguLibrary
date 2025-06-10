import Button from "../../components/common/Button";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import PageModal from "../../components/common/PageModal";
import { useState, useCallback } from "react";
import PhoneAuthComponent from "../../components/member/PhoneAuthComponent";
import PhoneCheckComponent from "../../components/member/PhoneCheckComponent";
import { useNavigate, useLocation } from "react-router-dom";

const AuthPage = () => {
const [isOpen, setIsOpen] = useState(false);
const navigate  = useNavigate();
const location = useLocation();

const handleAuth = useCallback(() => {
setIsOpen(true);
},[])

const handleClose = useCallback(() => {
setIsOpen(false);
},[]);



const handleSuccess = (pageData) => {
const prev = location.state || {};
navigate("/signup/join", { state: { ...prev ,...pageData} });
}

const pageMap = {
    phoneAuth : { component : PhoneAuthComponent },
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess, phoneCheck : false } }
}

return (
<Layout sideOn={false}>
    <SubHeader subTitle="회원가입" mainTitle="기타" />
    <div className="p-6 max-w-3xl mx-auto mb-10">
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