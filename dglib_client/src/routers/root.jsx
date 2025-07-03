import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./Loading";
import booksRouter from "./booksRouter";
import { Outlet } from "react-router-dom";
import signUpRouter from "./signUpRouter";
import aboutRouter from "./aboutRouter";
import adminRouter from "./adminRouter";
import usageRouter from "./usageRouter";
import reservationRouter from "./reservationRouter";
import communityRouter from "./communityRouter";
import myLibraryRouter from "./myLibraryRouter";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedManagerRoute from "./ProtectedManagerRoute";




const Main = lazy(()=> import ("../pages/MainPage"));
const About = lazy(()=> import ("../pages/AboutPage"));
const Books = lazy(()=> import ("../pages/BooksPage"));
const Login = lazy(()=> import ("../pages/LoginPage"));
const Logout = lazy(()=> import ("../pages/LogoutPage"));
const MemberCard = lazy(()=> import ("../pages/MemberCardPage"));
const Admin = lazy(()=> import ("../pages/AdminPage"));
const Usage = lazy(()=> import ("../pages/UsagePage"));
const SearchBookApi = lazy(()=> import ("../components/books/SearchBookApiComponent"));
const Reservation = lazy(()=> import ("../pages/ReservationPage"));
const Community = lazy(()=> import ("../pages/CommunityPage"));
const MyLibrary = lazy(()=> import ("../pages/MyLibraryPage"));
const MemberSearch = lazy(()=> import ("../components/admin/MemberSearchComponent"));
const LibraryBookSearch = lazy(()=> import ("../components/admin/LibraryBookSearchComponent"));
const FindAccount = lazy(()=> import ("../pages/FindAccountPage"));
const InfoMod = lazy(()=> import ("../pages/InfoModPage"));
const EbookViewer = lazy(() => import("../components/books/EbookViewerComponent"));
const KakaoRedirect = lazy(() => import("../pages/KakaoRedirectPage"));
const SmsSearch = lazy(() => import("../components/admin/SmsSearchComponent"));
const EmailRead = lazy(() => import("../components/admin/EmailReadComponent"));
const EmailWrite = lazy(() => import("../components/admin/EmailWriteComponent"));
const QRScan = lazy(() => import("../components/admin/QRScanComponent"));
const LeaveComponent = lazy(()=> import("../components/member/LeaveComponent"));

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
        path: "mylib/card",
        element: <Suspense fallback={<Loading />}><MemberCard /></Suspense>
    },
    {
        path: "mylibrary",
        element: <ProtectedRoute><Suspense fallback={<Loading />}><MyLibrary /></Suspense></ProtectedRoute>,
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
        element: <Suspense fallback={<Loading />}><Outlet /></Suspense>,
        children: signUpRouter()
    },
    {
        path: "admin",
        element: <ProtectedManagerRoute><Suspense fallback={<Loading />}><Admin /></Suspense></ProtectedManagerRoute>,
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
    },
    {
        path : "find/account",
        element: <Suspense fallback={<Loading />}><FindAccount /></Suspense>
    },
      {
        path : "modinfo",
        element: <Suspense fallback={<Loading />}><InfoMod /></Suspense>
    },
    {
        path: "viewer",
        element: <Suspense fallback={<Loading />}><EbookViewer /></Suspense>
    },
    {
        path: "login/kakao",
        element: <Suspense fallback={<Loading />}><KakaoRedirect /></Suspense>
    },
      {
            path: "smssearch",
            element: <Suspense fallback={<Loading />}><SmsSearch /></Suspense>
     },
      {
            path: "emailRead/:eid",
            element: <Suspense fallback={<Loading />}><EmailRead /></Suspense>
     },
      {
            path: "emailWrite",
            element: <Suspense fallback={<Loading />}><EmailWrite /></Suspense>
     },
      {
            path: "qrscan",
            element: <Suspense fallback={<Loading />}><QRScan /></Suspense>
     },
     {
            path: "leave",
            element: <Suspense fallback={<Loading />}><LeaveComponent /></Suspense>
     },


]);

export default root;