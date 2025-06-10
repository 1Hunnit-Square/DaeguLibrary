import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const TermsPage = lazy(()=> import ("../pages/signup/TermsPage"));
const AuthPage = lazy(()=> import ("../pages/signup/AuthPage"));
const JoinPage = lazy(()=> import ("../pages/signup/JoinPage"));
const KakaoAccount = lazy(() => import("../pages/KakaoAccountPage"));

const signUpRouter = () => ([

    {
        path : "",
        element: <Navigate to="terms" replace />
    },
    {
        path : "terms",
        element: <Suspense fallback={<Loading />}><TermsPage /></Suspense>
    },
    {
        path : "auth",
        element: <Suspense fallback={<Loading />}><AuthPage /></Suspense>
    },
    {
        path : "join",
        element: <Suspense fallback={<Loading />}><JoinPage /></Suspense>
    },
    {
        path: "kakao",
        element: <Suspense fallback={<Loading />}><KakaoAccount /></Suspense>
    }

])

export default signUpRouter;

