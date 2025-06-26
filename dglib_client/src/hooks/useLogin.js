import { loginPost, updateClaims } from "../api/memberApi";
import { setCookie, removeCookie } from "../util/cookieUtil";
import { useResetRecoilState, useRecoilState } from "recoil";
import RecoilLoginState from "../atoms/loginState";
import { loginKakao } from "../api/kakaoApi";
import { chatHistoryState, isChatOpenState, clientIdState } from '../atoms/chatState';
import { useQueryClient } from '@tanstack/react-query';

export const useLogin = () => {
    

const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);
const resetChatHistory = useResetRecoilState(chatHistoryState);
const resetClientId = useResetRecoilState(clientIdState);
const resetIsChatOpen = useResetRecoilState(isChatOpenState);
const queryClient = useQueryClient();

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
            
            resetChatHistory();
            resetClientId();
            resetIsChatOpen();
            queryClient.clear();
        }

        
const doLoginKakao = async (token) => {
    const paramData = new FormData();
    paramData.append("accessToken", token);
    const result = await loginKakao(paramData);
    if(!result.error){
    setCookie("auth",JSON.stringify(result), 1);
    setLoginState(result);
    }
    return result;
    }

const loginUpdate = async () => {
    const result = await updateClaims();
    setCookie("auth",JSON.stringify(result), 1);
    setLoginState(result);
    return result;
}


return{doLogin, doLogout, loginUpdate, doLoginKakao};

}
