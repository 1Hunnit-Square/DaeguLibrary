import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../atoms/loginState";
import Button from "../components/common/Button";
import { useState, useRef, useEffect } from "react";
import InfoModComponent from "../components/member/InfoModComponent";
import { getMemberInfo } from "../api/memberApi";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useReactToPrint } from "react-to-print";

const InfoModPage = () => {
const pwRef = useRef();
const mid = useRecoilValue(memberIdSelector);
const [ pwVerify , setPwVerify ] = useState("");
const [ modPage, setModPage ] = useState(false);
const [ memberData, setMemberData ] = useState({});
const navigate = useNavigate();
const { doLogout, loginUpdate } = useLogin();
const contentRef = useRef(null);
const reactToPrintFn = useReactToPrint({ contentRef });

const handleChange = (e) => {
    setPwVerify(e.target.value);
}

const handleClick = () => {
    if(pwVerify == ""){
        alert("비밀번호를 입력해주세요");
        return;
    }
    getMemberInfo({ pw : pwVerify})
    .then(data => {
        console.log(data);
        setMemberData(data);
        setModPage(true);
    })
    .catch(e => {
        console.error(e);
        alert("비밀번호가 일치하지않습니다.");

    });
    
}

const onKeyDown = (e) => {
if(e.key === "Enter")
    handleClick();
}



useEffect(()=>{
pwRef.current?.focus();


const handleMessage = (event) => {
    const { leave } = event.data;
    if(!leave)
        return;
    else{
        navigate("/",{replace: true});
    }   
    }

    window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
},[])

const handleSuccess = () => {

loginUpdate().then(res => {
        alert("정보 수정 완료");
        navigate("/");
    }).catch(error => {
        console.error(error);
        alert("업데이트 된 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.");
        doLogout();
        navigate("/");

    });

}

    return (<Layout sideOn={false}>
        <SubHeader subTitle ="정보수정" mainTitle ="기타" print={reactToPrintFn} />
        { modPage? <InfoModComponent data={memberData} handleSuccess={handleSuccess} /> :  <div ref={contentRef}>
        <div className = "flex justify-center my-10"> 현재 사용중인 비밀번호를 입력하세요 </div>
        <div className = "text-center pb-3 font-bold">접속 ID : {mid}</div>
           <input ref={pwRef} type="password" required
           className="block w-55 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"pw"} value = {pwVerify} onChange={handleChange} onKeyDown={onKeyDown} placeholder="비밀번호를 입력하세요"
           />
           <div className = "flex justify-center my-10">
            <Button onClick={handleClick}>확인</Button>
           </div>
           </div>
    }
        </Layout>
    );
}

export default InfoModPage;