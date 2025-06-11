import { atom, selector } from "recoil";
import { getCookie } from "../util/cookieUtil";

const loginState = atom({
    key:'loginState',
    default: loadCookie()
})

export const memberIdSelector = selector({
    key: 'memberIdSelector',
    get: ({get}) => {
        const login = get(loginState);
        return login?.mid || null;
    }
});

export const memberNameSelector = selector({
    key: 'memberNameSelector',
    get: ({get}) => {
        const login = get(loginState);
        return login?.name || null;
    }
});

export const memberMnoSelector = selector({
    key: 'memberMnoSelector',
    get: ({get}) => {
        const login = get(loginState);
        return login?.mno || null;
    }
});

export const memberRoleSelector = selector({
    key : 'memberRoleSelector',
    get: ({get}) =>{
        const login = get(loginState);
        return login?.roleName || null;
    }
})

function loadCookie(){
    const memberInfo = getCookie("auth") ?? {};
    if(memberInfo){
        memberInfo.name = decodeURIComponent(memberInfo.name);
    }
    return memberInfo;
}

export default loginState