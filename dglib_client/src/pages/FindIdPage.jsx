import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import Button from "../components/common/Button";
import PageModal from "../components/common/PageModal";
import { useState, useCallback } from "react";
import PhoneAuthComponent from "../components/member/PhoneAuthComponent";
import PhoneCheckComponent from "../components/member/PhoneCheckComponent";
import { idFind } from "../api/memberApi";
import { useMutation } from "@tanstack/react-query";

const FindIdPage = () => {

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
    phoneAuth : { component : PhoneAuthComponent },
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess, phoneCheck : true } }
    }

    const handleChange = (e) => {
        setFindForm (prev => ({
            ...prev,
            [e.target.name] : e.target.value
        }))

        
    }

    return(
        <Layout sideOn={false}>
            <SubHeader subTitle="아이디 찾기" mainTitle="기타" />
            {idFindMutation.isIdle && <>
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold my-10 text-center">아이디 찾기</div>
               
                <label className="col-span-1">이름</label>
                <input name={"name"} value={findForm.name} onChange={handleChange} className = "col-span-2 border rounded w-30" />
                
                <label className="col-span-1">생년월일</label>
                <input name={"birthDate"} value={findForm.birthDate} onChange={handleChange} type="date" className = "col-span-2 border rounded w-30" />
                 </div>
                 <div className="flex justify-center">
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
           
        </Layout>
    )

}

export default FindIdPage;