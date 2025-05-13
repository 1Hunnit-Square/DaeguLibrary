import Layout from "../layouts"
import { useRecoilState } from "recoil";
import RecoilLoginState from '../atoms/loginState';
import LoginComponent from "../components/member/LoginComponent";





const LoginPage = () => {
    const [loginState, setLoginState ] = useRecoilState(RecoilLoginState);

    return (
            <Layout sideOn={false}>
        <div className="mt-10 mb-3">
        대구 도서관에 오신 것을 환영합니다.
        </div>
        <h1 className="text-4xl mb-3 font-bold text-gray-900">대구 도서관</h1>
        <h2 className="text-2xl font-semibold text-gray-700">회원 로그인</h2>
             <LoginComponent />
        </Layout>
    )
}

export default LoginPage;