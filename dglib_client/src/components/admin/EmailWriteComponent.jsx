import MailQuillComponent from "../common/MailQuillComponent";
import { useRecoilValue } from "recoil";
import { memberRoleSelector } from "../../atoms/loginState";
import { useEffect } from "react";

const EmailWriteComponent = () =>{

const role = useRecoilValue(memberRoleSelector);

const sendParams = (paramData) => {

console.log(paramData);

}

const onBack = () => {
  window.close();
}


    useEffect(()=> {
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }},[])

return(<div className = "flex flex-col mt-10 items-center">
    <h1 className="text-3xl font-bold text-center text-[#00893B]">메일 쓰기</h1>
    {(role == "ADMIN") &&<MailQuillComponent onParams={sendParams} onBack={onBack} useTitle={true} usePinned={false} usePublic={false} />}
</div>
)

}

export default EmailWriteComponent;