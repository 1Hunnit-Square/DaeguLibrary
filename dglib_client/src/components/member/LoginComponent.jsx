import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { useState, useEffect, memo, useCallback } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useMoveTo } from "../../hooks/useMoveTo";
import { Link } from "react-router-dom";
import { kakaoURL } from "../../api/kakaoApi";

const LoginComponent = () =>{
    const [ loginParam, setLoginParam ] = useState({id : "", pw: ""});
    const [ savedId, setSavedId ] = useState(false);
    const { doLogin } = useLogin();
    const { moveToPath, moveToSaved } = useMoveTo();

    useEffect(()=>{
        const storeId = localStorage.getItem("savedId");
        if(storeId) {
            setLoginParam(prev => ({ ...prev, id : storeId}));
            setSavedId(true);
        }
    },[])

    const LoginClick = useCallback(()=> {
        if(savedId)
        localStorage.setItem("savedId",loginParam.id);
        else
        localStorage.removeItem("savedId");

        doLogin(loginParam).then(data => {

            if(data.error){
                if(data.message == "LEAVE MEMBER"){
                    alert("탈퇴한 회원은 로그인 할 수 없습니다.");
                } else {
                    alert("아이디와 비밀번호가 일치하지 않습니다.");
                }
                setLoginParam(prev => ({ ...prev, pw : ""}));
            }
            else {
                moveToSaved();
            }
        })


        },[loginParam, savedId]);

    const handleChange = (e) => {
        setLoginParam(prev => ({
        ...prev,
        [e.target.name]: e.target.value
        }));
    };

     const handleCheckBox = useCallback((e) => {
        setSavedId(e.target.checked);
    },[]);

    const handleKeydown= (e) =>{
    if(e.key === "Enter")
        LoginClick();
    }

    return(
        <div className= "w-60 mx-auto mb-12">
           <input type="text" required
           className="block w-55 mx-auto mt-5 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"id"} value = {loginParam.id} onChange={handleChange} placeholder="아이디를 입력하세요"
           />
           <input type="password" required
           className="block w-55 mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"pw"} value = {loginParam.pw} onChange={handleChange} onKeyDown={handleKeydown} placeholder="비밀번호를 입력하세요"
           />
           <div className="flex justify-start ml-3 mt-2 mb-5"><CheckBox label={"아이디저장"} checked={savedId} onChange={handleCheckBox} /></div>
           <Button onClick = {LoginClick} className="mx-auto mb-3 w-55">로그인</Button>
            <div className="flex justify-center mb-5 gap-3 text-xs">
                <Link to="/find/account?tab=id" className="hover:text-green-800">아이디 찾기</Link>
                <Link to="/find/account?tab=pw" className="hover:text-green-800">비밀번호 찾기</Link>
                <Link to="/signup" className="hover:text-green-800">회원가입</Link>
                </div>
            <div className="flex items-center w-full my-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <Link to={kakaoURL()} className="w-full">
            <img src="./kakao_login.png" className="mx-auto" /></Link>
     </div>
    )
}

export default LoginComponent;