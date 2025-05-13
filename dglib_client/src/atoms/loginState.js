import { atom, selector } from "recoil";
import { getCookie } from "../util/cookieUtil";

const loginState = atom({
    key:'loginState',
    default: loadCookie()
})

function loadCookie(){
    const memberInfo = getCookie("auth") ?? {};
    if(memberInfo){
        memberInfo.name = decodeURIComponent(memberInfo.name);
    }
    return memberInfo;
}

export default loginState