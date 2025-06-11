import { useEffect, useState, memo, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CheckBox from "../common/CheckBox";
import Button from "../common/Button";

const TermsComponent = () => {
const [libraryText, setLibaryText] = useState("");
const [privacyText, setPrivacyText] = useState("");
const [companyText, setCompanyText] = useState("");
const [ checkTerms, setCheckTerms ] = useState({ library : false, privacy : false, company : false})
const [ searchURLParams, setSearchURLParams] = useSearchParams();
const navigate = useNavigate();
const location = useLocation();
const { kakaoToken } = location.state || {};

const termStyle = "border p-3 pt-5 mb-10 h-48 overflow-y-scroll whitespace-pre-wrap bg-white-100 text-sm text-left";

useEffect(() => {
fetch("/terms/library.txt")
.then((res) => res.text())
.then((text) => setLibaryText(text));

fetch("/terms/privacy.txt")
.then((res) => res.text())
.then((text) => setPrivacyText(text));

fetch("/terms/company.txt")
.then((res) => res.text())
.then((text) => setCompanyText(text));

},[]);

useEffect(() => {
if(searchURLParams.get("account") == "kakao"){
  if(kakaoToken){
    return;
    } else{
    alert("토큰이 존재하지않습니다. 카카오 인증을 다시 시도해주세요");
    navigate("/login",{replace : true});
  }

}
},[searchURLParams.toString()])

const handleCheckBox = useCallback((e, value) => {
        if(value == "all"){
        const checking = e.target.checked ? true : false;
        setCheckTerms((prev) => {
           const updatedTerms = Object.keys(prev).reduce((acc, key) => {
                acc[key] = checking;
                return acc;
            }, {});
            return updatedTerms;
        })
        } else {
        setCheckTerms((prev) => ({
           ...prev,  [value] : e.target.checked
        }));
        }
    },[]);

const handleNext = useCallback(() => {
if(checkTerms.library&&checkTerms.privacy&&checkTerms.company){
const prev = location.state || {};
const urlParam = searchURLParams.get("account") == "kakao" ? "?account=kakao" : ""
navigate(`/signup/auth${urlParam}`, { state: { ...prev} });

} else {
  alert("이용약관에 동의해주셔야 서비스 이용이 가능합니다.")
}
},[checkTerms]);


return (
<>
        <div className = "flex items-center justify-between my-2">
            <span className = "text-2xl">대구 광역시 도서관 이용약관</span>
        <CheckBox label = {<>동의합니다. <span className='text-red-500'>[필수]</span></>} checked={checkTerms.library} onChange={(e)=> handleCheckBox(e, "library")}/>
        </div> 
        <div className={termStyle}>
          {libraryText}
        </div>

        <div className = "flex items-center justify-between my-2">
            <span className = "text-2xl">개인 정보 수집 및 이용 동의</span>
        <CheckBox label = {<>동의합니다. <span className='text-red-500'>[필수]</span></>} checked={checkTerms.privacy} onChange={(e)=> handleCheckBox(e, "privacy")}/>
        </div> 
        <div className={termStyle}>
          {privacyText}
        </div>

        <div className = "flex items-center justify-between my-2">
            <span className = "text-2xl">개인정보 처리 및 위탁에 관한 안내</span>
        <CheckBox label = {<>동의합니다. <span className='text-red-500'>[필수]</span></>} checked={checkTerms.company} onChange={(e)=> handleCheckBox(e, "company")}/>
        </div> 
        <div className={termStyle}>
          {companyText}
        </div>
        
        <div className = "flex justify-center mb-8">
            <CheckBox label = {"전체 동의합니다."}
            checked={checkTerms.library&&checkTerms.privacy&&checkTerms.company} onChange={(e)=> handleCheckBox(e, "all")}/>
            
        </div> 
        <div className = "flex justify-center">
        <Button onClick={handleNext}>회원가입</Button>
        </div>
      
      
</>
);
};

export default TermsComponent;