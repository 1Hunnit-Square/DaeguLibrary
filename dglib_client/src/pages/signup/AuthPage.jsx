import Button from "../../components/common/Button";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import Modal from "../../components/common/Modal";
import { useState, useCallback } from "react";
import PhoneAuthComponent from "../../components/member/PhoneAuthComponent";
import PhoneCheckComponent from "../../components/member/PhoneCheckComponent";

const AuthPage = () => {
const [isOpen, setIsOpen] = useState(false);
const [ authStep, setAuthStep ] = useState("phoneAuth");
const [ phoneNum, setPhoneNum ] = useState("");

const handleAuth = useCallback(() => {
setIsOpen(true);
},[])

const handleClose = useCallback(() => {
setIsOpen(false);
setAuthStep("phoneAuth");
},[]);

const handleNext = useCallback((step, phone = "") => {
setAuthStep(step);
setPhoneNum(phone);
},[]);

return (
<Layout sideOn={false}>
    <SubHeader subTitle="회원가입" mainTitle="기타" />
    <div className="p-6 max-w-3xl mx-auto mb-10">
        <h1 className = "flex text-3xl font-bold mb-10 justify-center">휴대폰 인증</h1>
        <div className = "flex justify-center">
        <Button onClick={handleAuth}>인증하기</Button>
        </div>
    </div>
<Modal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose}>
    {authStep == "phoneAuth" && <PhoneAuthComponent handleNext={handleNext} />}
    {authStep == "authCode" && <PhoneCheckComponent phoneNum={phoneNum} handleNext={handleNext}/>}
</Modal>
</Layout>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
);
}

export default AuthPage;