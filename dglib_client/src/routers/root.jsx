import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import genreRouter from "./genreRouter";
import Loading from "./Loading";
import { Navigate } from "react-router-dom";

const Main = lazy(()=> import ("../pages/MainPage"));
const About = lazy(()=> import ("../pages/AboutPage"));
const Login = lazy(()=> import ("../pages/LoginPage"));
const Logout = lazy(()=> import ("../pages/LogoutPage"));
const None = lazy(()=> import ("../pages/NonePage"));
const BooksSearch = lazy(()=> import ("../pages/BooksSearch"));

const root = createBrowserRouter([

    {
        path: "",
        element: <Suspense fallback={<Loading />}><Main /></Suspense>,
        children: genreRouter()
    },
    {
        path: "about",
        element: <Suspense fallback={<Loading />}><About /></Suspense>,
        children: [
            { path: "greeting", element: <Suspense fallback={<Loading />}><None /></Suspense> },
            { path: "organization", element: <Suspense fallback={<Loading />}><None /></Suspense> },
            { path: "policy", element: <Suspense fallback={<Loading />}><None /></Suspense> },
            { path: "location", element: <Suspense fallback={<Loading />}><None /></Suspense> },
        ]
    },
    {
        path: "books",
        element: <Suspense fallback={<Loading />}><BooksSearch /></Suspense>,
        children: [
            { path: "search", element: <Suspense fallback={<Loading />}><BooksSearch /></Suspense> },
            { path: "organization", element: <Suspense fallback={<Loading />}><None /></Suspense> },
            { path: "policy", element: <Suspense fallback={<Loading />}><None /></Suspense> },
            { path: "location", element: <Suspense fallback={<Loading />}><None /></Suspense> },
        ]
    },
    {
        path: "usage/*",
        element: <Suspense fallback={<Loading />}><None /></Suspense>
    },
    {
        path: "reservation/*",
        element: <Suspense fallback={<Loading />}><None /></Suspense>
    },
    {
        path: "community/*",
        element: <Suspense fallback={<Loading />}><None /></Suspense>
    },
    {
        path: "mylib/*",
        element: <Suspense fallback={<Loading />}><None /></Suspense>
    },
    {
        path: "login",
        element: <Suspense fallback={<Loading />}><Login /></Suspense>
    },
    {
        path: "logout",
        element: <Suspense fallback={<Loading />}><Logout /></Suspense>
    },
    {
        path: "signup",
        element: <Suspense fallback={<Loading />}><None /></Suspense>
    },

]);

export default root;