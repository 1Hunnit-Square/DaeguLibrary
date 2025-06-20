import MailQuillComponent from "../common/MailQuillComponent";
import { useRecoilValue } from "recoil";
import { memberRoleSelector } from "../../atoms/loginState";
import { useEffect } from "react";
import { sendMailPost } from "../../api/mailApi";
import { API_ENDPOINTS, ORIGIN_URL } from "../../api/config";

const EmailWriteComponent = () =>{

const role = useRecoilValue(memberRoleSelector);

const sendParams = (paramData) => {


paramData.append("trackPath", `${ORIGIN_URL}${API_ENDPOINTS.mail}/readMail/`);
sendMailPost(paramData)
.then(res => {
    alert("전송완료");
}).catch(error => {
    console.error(error)
    alert("메일 전송에 오류가 있습니다.");
});

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
    <h1 className="text-3xl font-bold text-center text-[#00893B">메일 쓰기</h1>
    {(role == "ADMIN") &&<MailQuillComponent onParams={sendParams} onBack={onBack} />}
</div>
)

}

export default EmailWriteComponent;