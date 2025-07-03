import Button from "../common/Button";
import PageModal from "../common/PageModal";
import { useState, useCallback } from "react";
import PhoneAuthComponent from "./PhoneAuthComponent";
import PhoneCheckComponent from "./PhoneCheckComponent";
import { idFind } from "../../api/memberApi";
import { useMutation } from "@tanstack/react-query";

const FindIdComponent = () => {

    const [ isOpen, setIsOpen ] = useState(false);
    const [ findForm, setFindForm ] = useState({name : "", birthDate : ""});


    const idFindMutation = useMutation({
    mutationFn : (param) => idFind(param),
    onSuccess: (data) => {
    console.log(data);
    },
    onError: (error) => {
    console.error("error :", error);
    }
   });

    const handleClick = () => {
            if(!findForm.name.trim() || !findForm.birthDate){
            alert("이름과 생년월일을 입력해주세요.");
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



    const PageMap = {
    phoneAuth : { component : PhoneAuthComponent},
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess, phoneCheck : true } }
    }

    const handleChange = (e) => {
        setFindForm (prev => ({
            ...prev,
            [e.target.name] : e.target.value
        }))

        
    }

    return(
        <>
            {idFindMutation.isIdle && <>
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold mt-1 mb-10 text-center">아이디 찾기</div>
               
                <label className="col-span-1">이름</label>
                <input name={"name"} value={findForm.name} onChange={handleChange} className = "col-span-2 w-40 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500" />
                
                <label className="col-span-1">생년월일</label>
                <input name={"birthDate"} value={findForm.birthDate} onChange={handleChange} type="date" className = "col-span-2 w-40 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500" />
                 </div>
                 <div className="flex justify-center pt-6">
                <Button onClick ={handleClick}>아이디 찾기</Button></div>
                </>}
            {!idFindMutation.isIdle && <>
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold my-10 text-center">아이디 찾기 결과</div>
            {idFindMutation.isSuccess && <div className ="col-span-3 text-center">ID : {idFindMutation.data}</div>}
            {idFindMutation.isError && <div className ="col-span-3 text-center">일치하는 정보가 없습니다.</div>}
                </div>
                </>}
    <PageModal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose} PageMap={PageMap} defaultPage={"phoneAuth"} />      
</>
    )

}

export default FindIdComponent;