import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const TermsPage = lazy(()=> import ("../pages/signup/TermsPage"));
const AuthPage = lazy(()=> import ("../pages/signup/AuthPage"));

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
    }


])

export default signUpRouter;

