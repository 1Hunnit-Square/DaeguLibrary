import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./Loading";
import booksRouter from "./booksRouter";
import { Outlet } from "react-router-dom";
import aboutRouter from "./aboutRouter";
import adminRouter from "./adminRouter";


const Main = lazy(()=> import ("../pages/MainPage"));
const About = lazy(()=> import ("../pages/AboutPage"));
const Books = lazy(()=> import ("../pages/BooksPage"));
const Login = lazy(()=> import ("../pages/LoginPage"));
const Logout = lazy(()=> import ("../pages/LogoutPage"));
const None = lazy(()=> import ("../pages/NonePage"));
const Admin = lazy(()=> import ("../pages/AdminPage"));
const SearchBookApi = lazy(()=> import ("../components/books/SearchBookApiComponent"));


const root = createBrowserRouter([

    {
        path: "",
        element: <Suspense fallback={<Loading />}><Main /></Suspense>,
    },
    {
        path: "about",
        element: <Suspense fallback={<Loading />}><About /></Suspense>,
        children: aboutRouter()
    },
    {
        path: "books",
        element: <Suspense fallback={<Loading />}><Books /></Suspense>,
        children: booksRouter()
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
    {
        path: "admin",
        element: <Suspense fallback={<Loading />}><Admin /></Suspense>,
        children: adminRouter()
    },
    {
        path: "searchbookapi",
        element: <Suspense fallback={<Loading />}><SearchBookApi /></Suspense>

    }

]);

export default root;