import Button from "../../components/common/Button";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import Modal from "../../components/common/Modal";
import { useState } from "react";
import PhoneAuthComponent from "../../components/member/PhoneAuthComponent";
import AuthCodeComponent from "../../components/member/AuthCodeComponent";

const AuthPage = () => {
const [isOpen, setIsOpen] = useState(false);
const [ authStep, setAuthStep ] = useState("phoneAuth");
const [ phoneNum, setPhoneNum ] = useState("");

function handleAuth(){
setIsOpen(true);
}

function handleClose(){
setIsOpen(false);
setAuthStep("phoneAuth");
}

function handleNext(step, phone = ""){
setAuthStep(step);
setPhoneNum(phone);
}

return (
<Layout sideOn={false}>
    <SubHeader subTitle="회원가입" mainTitle="기타" />
    <div className="p-6 max-w-3xl mx-auto mb-10">
        <h1 className = "text-3xl font-bold mb-10">휴대폰 인증</h1>
        <Button onClick={handleAuth}>인증하기</Button>
    </div>
<Modal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose}>
    {authStep == "phoneAuth" && <PhoneAuthComponent handleNext={handleNext} />}
    {authStep == "authCode" && <AuthCodeComponent phoneNum={phoneNum} handleNext={handleNext}/>}
</Modal>
</Layout>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
);
}

export default AuthPage;