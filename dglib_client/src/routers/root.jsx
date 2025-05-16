import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./Loading";
import booksRouter from "./booksRouter";
import { Outlet } from "react-router-dom";
import aboutRouter from "./aboutRouter";
import adminRouter from "./adminRouter";
import usageRouter from "./usageRouter";
import reservationRouter from "./reservationRouter";
import communityRouter from "./communityRouter";
import myLibraryRouter from "./myLibraryRouter";


const Main = lazy(()=> import ("../pages/MainPage"));
const About = lazy(()=> import ("../pages/AboutPage"));
const Books = lazy(()=> import ("../pages/BooksPage"));
const Login = lazy(()=> import ("../pages/LoginPage"));
const Logout = lazy(()=> import ("../pages/LogoutPage"));
const None = lazy(()=> import ("../pages/NonePage"));
const Admin = lazy(()=> import ("../pages/AdminPage"));
const Usage = lazy(()=> import ("../pages/UsagePage"));
const SearchBookApi = lazy(()=> import ("../components/books/SearchBookApiComponent"));
const Reservation = lazy(()=> import ("../pages/ReservationPage"));
const Community = lazy(()=> import ("../pages/CommunityPage"));
const MyLibrary = lazy(()=> import ("../pages/MyLibraryPage"));
const MemberSearch = lazy(()=> import ("../components/admin/MemberSearchComponent"));
const LibraryBookSearch = lazy(()=> import ("../components/admin/LibraryBookSearchComponent"));

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
        path: "usage",
        element: <Suspense fallback={<Loading />}><Usage /></Suspense>,
        children: usageRouter()
    },
    {
        path: "reservation",
        element: <Suspense fallback={<Loading />}><Reservation /></Suspense>,
        children: reservationRouter()
    },
    {
        path: "community",
        element: <Suspense fallback={<Loading />}><Community /></Suspense>,
        children: communityRouter()
    },
    {
        path: "mylibrary",
        element: <Suspense fallback={<Loading />}><MyLibrary /></Suspense>,
        children: myLibraryRouter()
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

    },
    {
        path: "membersearch",
        element: <Suspense fallback={<Loading />}><MemberSearch /></Suspense>
    },
    {
        path : "librarybooksearch",
        element: <Suspense fallback={<Loading />}><LibraryBookSearch /></Suspense>
    }


]);

export default root;