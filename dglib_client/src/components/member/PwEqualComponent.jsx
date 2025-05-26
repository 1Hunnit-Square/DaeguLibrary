import Button from "../common/Button";
import { memo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

const PwEqualComponent = ({pw1, pw2, handleForm, check}) => {


useEffect(()=>{
    if(pw1 == pw2 && pw2 != ""){
    handleForm(true, "pw2");
    } else
    handleForm(false,"pw2");
},[pw1, pw2])

return(<>
    {(!check && pw2!="") && <div className = "w-70 text-red-500">비밀번호가 일치해야합니다.</div>}
    {(check) && <div className = "w-70 text-blue-500">비밀번호가 일치합니다.</div>}
    </>
);
}

export default memo(PwEqualComponent);