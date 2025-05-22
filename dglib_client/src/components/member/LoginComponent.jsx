import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { useRecoilState } from "recoil";
import RecoilLoginState from '../../atoms/loginState';
import { useState, useEffect, memo, useCallback } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useMoveTo } from "../../hooks/useMoveTo";
import { Link } from "react-router-dom";

const LoginComponent = () =>{
    const [ loginState, setLoginState ] = useRecoilState(RecoilLoginState);
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
            console.log(data);

            if(data.error){
                alert("로그인 실패 ㅋ");
                setLoginParam(prev => ({ ...prev, pw : ""}));
            }
            else {
                alert(data.name+"님 ㅎㅇ");
                moveToSaved();
            }
        },[loginParam, savedId])

        
        });
    
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
        <div className= "w-60 mx-auto">
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
            <div className="flex justify-center mb-10 gap-3 text-xs">
                <Link to="/findid" className="hover:text-green-800">아이디 찾기</Link>
                <Link to="/" className="hover:text-green-800">비밀번호 찾기</Link>
                <Link to="/signup" className="hover:text-green-800">회원가입</Link>
                </div>
     </div>
    )
}

export default LoginComponent;