import Button from "../common/Button";
import { memo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { idExist } from "../../api/memberApi";

const IdCheckComponent = ({id, handleForm, check}) => {

const idCheckMutation = useMutation({
    mutationFn : (param) => idExist(param),
        onSuccess: (data) => {
        console.log(data);
            if(data)
                alert("중복된 아이디입니다.");
            else{
                alert("사용 가능한 아이디입니다.")
                handleForm(true);
            }

        },
        onError: (error) => {
        console.error("error :", error);
        }
})

const handleIdCheck = () =>{
    if(id == ""){
        alert("아이디를 입력하세요");
        return;
    }
const param = { mid : id }
idCheckMutation.mutate(param);
}

useEffect(()=>{
handleForm(false);
},[id])

return(<>
    {!check && <Button className={"bg-orange-500 hover:bg-orange-600"} onClick={handleIdCheck}>중복확인</Button>}
    {check && <Button className={"bg-blue-400 pointer-events-none"} >사용가능</Button>}
    </>
);
}

export default memo(IdCheckComponent);