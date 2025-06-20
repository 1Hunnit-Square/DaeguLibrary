import { useEffect, useState } from "react";
import { getMailDetail } from "../../api/mailApi";
import _ from "lodash";
import ContentComponent from "../common/ContentComponent";
import { useSearchParams, useParams } from "react-router-dom";
import { memberRoleSelector, memberIdSelector, memberNameSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";
import Loading from "../../routers/Loading";
import Download from "../common/Download";
import { API_SERVER_HOST, API_ENDPOINTS } from "../../api/config";

const EmailReadComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { eid } = useParams();
    const [ mailDetail, setMailDetail ] = useState({});
    const role = useRecoilValue(memberRoleSelector);
    const mid = useRecoilValue(memberIdSelector);
    const name = useRecoilValue(memberNameSelector);
   
    useEffect(()=> {
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }

        getMailDetail(eid, { mailType : searchURLParams.get("mailType")})
        .then(res => {
            setMailDetail(res);
            console.log(res);
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


return(
    <div className = "my-10">
    {
     !_.isEmpty(mailDetail) ? 
   <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6">

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
    <Download key={index} link={`${API_SERVER_HOST}${API_ENDPOINTS.mail}/view/${file.filePath}`} fileName={file.originalName} />
    )}
  </div>
</div>
: <Loading text="메일 읽는 중.." />
}
    </div>
);
}

export default EmailReadComponent;