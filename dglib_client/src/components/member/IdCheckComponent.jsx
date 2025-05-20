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
                alert("중복된 아이디입니다. 다른 아이디를 입력해주세요.");
            else{
                alert("사용 가능한 아이디입니다.")
                handleForm(true,"id");
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
    } else if(!(/[A-Za-z]/.test(id) && /\d/.test(id) && /^[A-Za-z0-9]+$/.test(id)) || !(id.length>=6 && id.length <= 16)){
        alert("아이디는 영문과 숫자가 포함된 조합에 맞게 6자 이상 16자 이하로 입력해주세요.");
        return;
    }
const param = { mid : id }
idCheckMutation.mutate(param);
}

useEffect(()=>{
handleForm(false,"id");
},[id])

return(<>
    {!check && <Button className={"bg-orange-500 hover:bg-orange-600"} onClick={handleIdCheck}>중복확인</Button>}
    {check && <Button className={"bg-blue-400 pointer-events-none"} >사용가능</Button>}
    </>
);
}

export default memo(IdCheckComponent);