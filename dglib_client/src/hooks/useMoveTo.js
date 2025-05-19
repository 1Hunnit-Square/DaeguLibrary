import { useLocation, useNavigate } from "react-router-dom"



export const useMoveTo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    
    const moveToPath = (path) => {
    navigate({pathname: path}, {replace:true})
    }

     const moveToLogin = (message = "로그인이 필요합니다.") => {
        const currentPath = location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, {replace: false});
        if (message) {
            alert(message);
        }
    };
    const moveToSaved = () => {
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect');

        if (redirectTo) {
            navigate(redirectTo, {replace: true});
        } else {
            navigate('/', {replace: true});
        }
    };



return {moveToPath, moveToLogin, moveToSaved}; 
} 