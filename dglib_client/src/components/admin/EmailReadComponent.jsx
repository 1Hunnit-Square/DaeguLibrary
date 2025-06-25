import { useEffect, useState } from "react";
import { delMail, getMailDetail } from "../../api/mailApi";
import _ from "lodash";
import ContentComponent from "../common/ContentComponent";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { memberRoleSelector, memberIdSelector, memberNameSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Loading from "../../routers/Loading";
import Download from "../common/Download";
import { API_SERVER_HOST, API_ENDPOINTS } from "../../api/config";
import Button from "../common/Button";
import { ReceiptRussianRuble } from "lucide-react";

const EmailReadComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { eid } = useParams();
    const [ mailDetail, setMailDetail ] = useState({});
    const role = useRecoilValue(memberRoleSelector);
    const mid = useRecoilValue(memberIdSelector);
    const name = useRecoilValue(memberNameSelector);
    const navigate = useNavigate();
   
    useEffect(()=> {
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }

        getMailDetail(eid, { mailType : searchURLParams.get("mailType")})
        .then(res => {
            setMailDetail(res);
        }).catch(error => {
            console.error(error);
            alert("메일을 읽는 중에 오류가 발생하였습니다.");

        }).finally(()=>{
            window.opener.postMessage({reload : true},"*")
        })

    },[])


    const fromToStr = (ename, email) => {
        if(email == mid+"@dglib.kro.kr"){
            return name +" <"+email+">"
        }
            const addname = ename ? ename + " " : "";
            return addname+"<"+email+">"
        }
    
    const ToListStr = (names, emails) => {
        return emails.map((email, index) => 
            fromToStr(names[index], email)
        ).join(", ");
    }

    const handleDelete = () => {
        const checkConfirm = confirm("메일을 삭제하시겠습니까?");

        if(!checkConfirm){
        return;
        }

        delMail(eid, { mailType : searchURLParams.get("mailType")}).then(res => {
            alert("메일이 삭제되었습니다.");
            window.opener.postMessage({reload : true},"*");
            window.close();
        }).catch(error => {
            alert("삭제에 실패했습니다.");
        })

    }

return(
    <div className = "mb-15">
    {
     !_.isEmpty(mailDetail) ? 
     <>
     <div className="sticky top-0 z-50 bg-white pt-5 mb-7">
     <h1 className="text-3xl font-bold text-center py-5 text-[#00893B]">메일 읽기</h1>
      <hr className="border-t border-gray-300 my-3" />
     <div className="flex justify-between w-4xl px-3 mx-auto">
     <div className="flex gap-3">
     <Button onClick = {()=> navigate(`/emailWrite?sendType=reply&eid=${eid}`)}>답장</Button>
     <Button onClick = {()=> navigate(`/emailWrite?sendType=forward&eid=${eid}`)} className="bg-blue-400 hover:bg-blue-500">전달</Button>
     <Button onClick={handleDelete} className="bg-red-400 hover:bg-red-500">삭제</Button>
     </div>
     <Button onClick={()=>{window.close()}} className="bg-gray-400 hover:bg-gray-500">닫기</Button>
     </div>
     <hr className="border-t border-gray-300 mt-3" />
     </div>
      
   <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 border border-gray-400">

  <h1 className="text-2xl font-bold text-gray-800">{mailDetail.subject}</h1>

  <div className="text-sm text-gray-600 space-y-1">
    <p><span className="font-semibold">보낸 사람:</span> {fromToStr(mailDetail.fromName, mailDetail.fromEmail)}</p>
    <p><span className="font-semibold">받는 사람:</span> {ToListStr(mailDetail.toName, mailDetail.toEmail)}</p>
    <p><span className="font-semibold">보낸 시간:</span> {mailDetail.sentTime}</p>
  </div>

  <hr className="border-t border-gray-300" />


  <div className="prose max-w-none text-gray-800">
   <ContentComponent content={mailDetail.content} type="email" />
  </div>


  <div className="pt-4 border-t border-gray-300">
    <h2 className="text-sm font-semibold text-gray-700 mb-2">첨부파일</h2>
    {mailDetail.fileList.map((file, index) => 
    <p className="mt-1" key={index}><Download link={`${API_SERVER_HOST}${API_ENDPOINTS.mail}/view/${file.filePath}`} fileName={file.originalName} /></p>
    )}
  </div>
</div>
</>
: <Loading text="메일 읽는 중.." />
}
    </div>
);
}

export default EmailReadComponent;