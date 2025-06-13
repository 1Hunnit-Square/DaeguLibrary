import { loginPost } from "../api/memberApi";
import { setCookie, removeCookie } from "../util/cookieUtil";
import { useResetRecoilState, useRecoilState } from "recoil";
import RecoilLoginState from "../atoms/loginState";

export const useLogin = () => {

const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);

const doLogin = async (loginParam) => {
    const result = await loginPost(loginParam);
    if(!result.error){
        setCookie("auth",JSON.stringify(result), 1);
        setLoginState(result);
    }
    
    return result;
    }

const doLogout = () => {
            removeCookie('auth');
            setLoginState({});
            localStorage.setItem('logout', Date.now());
        }


return{doLogin, doLogout};

}
