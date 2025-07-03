import Button from "../common/Button";
import PageModal from "../common/PageModal";
import { useState, useCallback } from "react";
import PhoneAuthComponent from "./PhoneAuthComponent";
import PhoneCheckComponent from "./PhoneCheckComponent";
import { accountFind, modMemberPw } from "../../api/memberApi";
import { useMutation } from "@tanstack/react-query";
import PwCheckComponent from "./PwCheckComponent";
import PwEqualComponent from "./PwEqualComponent";
import { useNavigate } from "react-router-dom";

const FindPwComponent = () => {

    const [ isOpen, setIsOpen ] = useState(false);
    const [ findForm, setFindForm ] = useState({mid : "", birthDate : ""});
    const [ modPw , setModPw ]  = useState({pw1: "", pw2:""});
    const [ pwCheck, setPwCheck ] = useState(false);
    const [ pwEqual, setPwEqual ] = useState(false);
    const navigate = useNavigate();

    const idFindMutation = useMutation({
    mutationFn : (param) => accountFind(param),
    onSuccess: (data) => {
    console.log(data);
    if(!data){
    alert("회원 정보를 찾을 수 없습니다. 다시 시도 해주세요.");
    idFindMutation.reset();
    }
    },
    onError: (error) => {
    console.error("error :", error);
    }
   });

    const modPwMutation = useMutation({
    mutationFn : (param) => modMemberPw(param),
    onSuccess: (data) => {
    console.log(data);
    alert("성공");
    navigate("/login");

    },
    onError: (error) => {
    console.error("error :", error);
    }
   });

    const handleClick = () => {
        if(!findForm.mid.trim() || !findForm.birthDate){
            alert("아이디와 생년월일을 입력해주세요.");
            return;
        }

        setIsOpen(true);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    const handleSuccess = (pageData) => {
        console.log(pageData);

        const paramForm = {
            ...findForm,
            phone : pageData.phone
        }

        idFindMutation.mutate(paramForm);
        handleClose();
    }

    const handleForm = (value, type) => {
        switch(type){
        case "pw1":
        setPwCheck(value);
        return;
        case "pw2":
        setPwEqual(value);
        return;
        }
        }


    const PageMap = {
    phoneAuth : { component : PhoneAuthComponent },
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess, phoneCheck : true } }
    }

    const handleChange = (e) => {
        setFindForm (prev => ({
            ...prev,
            [e.target.name] : e.target.value
        }))

        
    }

    const handleChangePw = (e) => {
        setModPw (prev => ({
            ...prev,
            [e.target.name] : e.target.value
        }))
    }

    const handleClickMod = () => {
        if(!(pwCheck && pwEqual)){
            alert("비밀번호가 형식에 맞지 않거나 일치하지 않습니다.");
            return;
        }

        const paramData = new FormData();
        paramData.append("mid", findForm.mid);
        paramData.append("pw",modPw.pw1);
        modPwMutation.mutate(paramData);
    }

    return(
            <>
            {!idFindMutation.data && <>
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold mt-1 mb-10 text-center">비밀번호 찾기</div>
               
                <label className="col-span-1">아이디</label>
                <input name={"mid"} value={findForm.mid} onChange={handleChange} className = "col-span-2 w-40 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500" />
                
                <label className="col-span-1">생년월일</label>
                <input name={"birthDate"} value={findForm.birthDate} onChange={handleChange} type="date" className = "col-span-2 w-40 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500" />
                 </div>
                 <div className="flex justify-center pt-6">
                <Button onClick ={handleClick}>비밀번호 찾기</Button></div>
                </>}
            {idFindMutation.isSuccess && idFindMutation.data && <>
             <div className = "justify-center items-center my-1 w-100 mx-auto gap-1">
             <div className = "mt-10 mb-13 text-center font-bold">비밀번호 재설정</div>
             <div className="flex justify-center">
                <input type="password" name={"pw1"} value={modPw.pw1} onChange={handleChangePw} placeholder="비밀번호를 입력하세요."
                className = "border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-500 w-60" /></div>
                <div className="flex justify-center h-10 pl-10">
                <PwCheckComponent pw={modPw.pw1} handleForm={handleForm} check={pwCheck}/>
                </div>
                <div className="flex justify-center mt-3">
                <input type="password" name={"pw2"} value={modPw.pw2} onChange={handleChangePw} placeholder="비밀번호를 다시 입력하세요."
                className = "border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-500 w-60" /></div>
                <div className="flex justify-center h-10 pl-10">
                <PwEqualComponent pw1={modPw.pw1} pw2={modPw.pw2} handleForm={handleForm} check={pwEqual}/>
                </div>
                <div className="flex justify-center mt-3">
                <Button onClick ={handleClickMod}>비밀번호 변경</Button></div></div>
            </>}
    <PageModal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose} PageMap={PageMap} defaultPage={"phoneAuth"} />      
    </>);
}
export default FindPwComponent;