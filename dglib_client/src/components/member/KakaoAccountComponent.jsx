import { useState } from "react";
import Button from "../common/Button";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";

const KakaoAccountComponent =({onClose, successHandler}) => {

    const [loginParam, setLoginParam ] = useState({id : "", pw :"" });
    const { doLogin, doLogout } = useLogin();

    const handleChange = (e) => {
        setLoginParam(prev => ({
        ...prev,
        [e.target.name]: e.target.value
        }));
    };
    
    const LoginClick = () =>{
            doLogin(loginParam).then(data => {
            console.log(data);

            if(data.error){
                alert("아이디와 비밀번호가 일치하지 않습니다.");
                setLoginParam(prev => ({ ...prev, pw : ""}));
            }
            else {
                const checkConfirm = confirm("현재 아이디를 카카오 계정과 연동하시겠습니까?");
                if(checkConfirm){
                   successHandler();
                } else {
                doLogout();
                alert("취소가 선택되어 현재 창이 닫히고 로그아웃 됩니다.");
                onClose();
                
                }
            }
        })
    }  

    const handleKeydown= (e) =>{
    if(e.key === "Enter")
        LoginClick();
    }

    return(
        <div className="flex flex-col justify-center items-center" >
            <div className ="font-bold text-4xl mt-7">대구 도서관</div>
            <div className ="font-bold text-2xl mt-3">기존 회원 로그인</div>
            <input type="text" required
           className="block w-55 mt-5 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"id"} value = {loginParam.id} onChange={handleChange} placeholder="아이디를 입력하세요"
           />
           <input type="password" required
           className="block w-55 mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"pw"} value = {loginParam.pw} onChange={handleChange} onKeyDown={handleKeydown} placeholder="비밀번호를 입력하세요"
           />
           <Button onClick = {LoginClick} className="my-4 w-55">로그인</Button>
           <div className ="font-bold my-4 text-center">
            <Link to = "/find/account?tab=id" className="text-blue-600 underline hover:text-blue-700" >
            아이디
            </Link> 또는 <Link to = "/find/account?tab=pw" className="text-blue-600 underline hover:text-blue-700" >
            비밀번호
            </Link>를 잃어버린 경우,<br />
           계정을 찾은 이후에 다시 시도해주세요.</div>
    </div>
    );
}

export default KakaoAccountComponent;