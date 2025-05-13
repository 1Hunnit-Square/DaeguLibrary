import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useRecoilState } from "recoil"
import RecoilLoginState from '../atoms/loginState';

const LoginMenu = () => {

    const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);
    const style = "hover:text-emerald-700 text-xs";
    

    return(
        <ul className="flex items-center justify-center space-x-6">
        {
        loginState.mid ? 
        <>
        <li><NavLink to="/logout" className={style}>로그아웃</NavLink></li>
        <li><NavLink to="/mypage" className={style}>마이페이지</NavLink></li>
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