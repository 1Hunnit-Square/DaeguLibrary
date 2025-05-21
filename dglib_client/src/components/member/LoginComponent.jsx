import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { useRecoilState } from "recoil";
import RecoilLoginState from '../../atoms/loginState';
import { useState, useEffect, memo, useCallback } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useMoveTo } from "../../hooks/useMoveTo";

const LoginComponent = () =>{
    const [ loginState, setLoginState ] = useRecoilState(RecoilLoginState);
    const [ loginParam, setLoginParam ] = useState({id : "", pw : ""});
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
        <>
           <input type="text" required
           className="block mx-auto mt-5 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"id"} value = {loginParam.id} onChange={handleChange} placeholder="아이디를 입력하세요"
           />
           <input type="password" required
           className="block mx-auto mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-500"
           name = {"pw"} value = {loginParam.pw} onChange={handleChange} onKeyDown={handleKeydown} placeholder="비밀번호를 입력하세요"
           />
           <div className="flex justify-center my-5"><CheckBox label={"아이디저장"} checked={savedId} onChange={handleCheckBox} /></div>
           <Button onClick = {LoginClick} className="mx-auto mb-10">로그인</Button>
     </>
    )
}

export default LoginComponent;