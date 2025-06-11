import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useRecoilValue } from "recoil"
import { memberIdSelector, memberNameSelector } from '../atoms/loginState';
const LoginMenu = () => {

    const mid = useRecoilValue(memberIdSelector);
    const name = useRecoilValue(memberNameSelector);
    const style = "hover:text-emerald-700 text-xs";
    
    return(
        <ul className="flex items-center justify-center space-x-6">
        {
        mid ? 
        <>
        <li>{name}님</li>
        <li><NavLink to="/logout" className={style}>로그아웃</NavLink></li>
        <li><NavLink to="/modinfo" className={style}>정보수정</NavLink></li>
        </>
        :
        <>
        <li><NavLink to="/login" className={style}>로그인</NavLink></li>
        <li><NavLink to="/signup" className={style}>회원가입</NavLink></li>
        </>
        }
      </ul>
    );
    
    }
    
    export default LoginMenu;