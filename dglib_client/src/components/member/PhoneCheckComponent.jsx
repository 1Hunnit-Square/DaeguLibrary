import Button from "../common/Button";
import { useState, useEffect, memo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { checkAuthCode, sendAuthCode } from "../../api/smsApi";
import { phoneExist } from "../../api/memberApi";

const PhoneCheckComponent = ({ pageData , handlePage, phoneCheck, handleSuccess }) => {
    const [ code, setCode ] = useState("");
    const [ retry, setRetry ] = useState(false);

    const smsSendMutation = useMutation({
    mutationFn : (num) => sendAuthCode(num),
    onSuccess: (data) => {
    console.log("메세지 전송 성공");
    },
    onError: (error) => {
    console.error("error :", error);
    }
   });

   const smsCheckMutation = useMutation({
    mutationFn: (params) => checkAuthCode(params),
    onSuccess: (data) => {
        console.log(data);
        // 인증 후 휴대폰 중복 체크
        data && phoneExist({phone : pageData.phoneNum}).then(data => {
        if(data == phoneCheck){
            handleSuccess({phone : pageData.phoneNum});
        } else {
            const message = data ? "이미 등록된 번호입니다. 다시 시도해주세요." : "등록되지 않은 번호입니다. 다시 시도해주세요.";
            alert(message);
            handlePage("phoneAuth");
        }
    }).catch(e => {
        console.error(e);
        alert("휴대폰 번호 확인에 오류가 발생했습니다. 다시 시도해주세요.")
         handlePage("phoneAuth");
    })
            },
    onError: (error) => {
    console.error("error :", error);
    }
   });

   useEffect(()=>{
    if(!pageData.phoneNum){
        alert("잘못된 접근입니다. 다시 시도해주세요.");
        handlePage("phoneAuth");
    }

    smsSendMutation.mutate(pageData.phoneNum.replace(/-/g,""));
  

   },[])

   const handleChange = (e) => {
    if (/[^0-9]/.test(e.target.value)) return;

    setCode(e.target.value);
    if(e.target.value.length == 6){
        const params = {
            phoneNum : pageData.phoneNum.replace(/-/g,""),
            authCode : e.target.value
        }
        smsCheckMutation.mutate(params);
   }
   };

   const handleClick= () => {
    if(!retry){
    const onConfirm = confirm(`${pageData.phoneNum}로 문자를 재전송 하겠습니까?`);
    
    if(onConfirm){
    smsSendMutation.mutate(pageData.phoneNum.replace(/-/g,""));
    setRetry(true);
    setTimeout(()=>{
    setRetry(false);
    }, 10000)

    }}
   };


    return (<>
    {smsSendMutation.isSuccess && <div className="flex justify-center">전송된 인증 코드를 입력하세요.</div>}
    {smsSendMutation.isPending && <div className="flex justify-center">인증 코드를 전송 중입니다...</div>}
    {smsSendMutation.isError && <div className="flex justify-center">인증 코드 전송에 실패했습니다.</div>}
    <div className="flex mx-auto mt-5 mb-3 justify-center items-center">
    <input type="text" value={code} className="border mr-1 rounded w-30 h-10 text-center text-xl" maxLength={6} onChange={handleChange} />
    {retry ?
    <Button className={"bg-gray-400 pointer-events-none"}>재전송</Button>
    : <Button onClick={handleClick}>재전송</Button>}
    </div>
    <div className="max-h-5 flex justify-center">
    {smsCheckMutation.isSuccess && smsCheckMutation.data && <div className="text-blue-500">인증 코드 확인이 완료되었습니다.</div>}
    {smsCheckMutation.isPending && <div>인증 코드를 확인 중입니다...</div>}
    {smsCheckMutation.isSuccess && !smsCheckMutation.data && <div className="text-red-500">잘못된 인증 코드를 입력하였습니다.</div>}
    </div>
    </>);
}

export default PhoneCheckComponent;