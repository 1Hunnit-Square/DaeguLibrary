import Button from "../common/Button";
import { memo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { idExist } from "../../api/memberApi";

const PwCheckComponent = ({pw, handleForm, check}) => {


useEffect(()=>{
    if((/[A-Za-z]/.test(pw) && /\d/.test(pw) && /[~!@#$%^&*]/.test(pw) && /^[A-Za-z0-9~!@#$%^&*]+$/.test(pw)) && (pw.length>=6 && pw.length <= 16))
        handleForm(true, "pw1");
    else
        handleForm(false,"pw1");
},[pw])

return(<>
    {(!check) && <div className = "w-70 text-red-500 text-sm">영문, 숫자, 특수문자(~!@#$%^&*)가 <br/> 포함된 조합에 맞게 6~16자로 입력해주세요.</div>}
    {(check) && <div className = "w-70 text-blue-500">올바른 형식의 비밀번호 입니다.</div>}
    </>
);
}

export default memo(PwCheckComponent);