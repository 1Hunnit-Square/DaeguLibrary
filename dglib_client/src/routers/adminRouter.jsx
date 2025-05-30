import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const RegBook = lazy(() => import("../components/admin/RegBookComponent"));
const BorrowBook = lazy(() => import("../components/admin/BorrowBookComponent"));
const BorrowBookList = lazy(() => import("../components/admin/BorrowBookListComponent"));
const Borrow = lazy(() => import("../components/admin/BorrowComponent"));
const BookManagement = lazy(() => import("../components/admin/BookManagementComponent"));
const MemberManagement = lazy(() => import("../components/admin/MemberManagementComponent"));
const EventManagement = lazy(() => import("../components/admin/EventManagementComponent"));
const EbookManagement = lazy(() => import("../components/admin/EbookManagementComponent"));



const adminRouter = () => ([
    {
        path: "",
        element: <Navigate to="bookmanagement" replace />
    },
    {
        path: "bookmanagement",
        element: <Suspense fallback={<Loading />}><BookManagement /></Suspense>
    },
    {
        path: "borrowbooklist",
        element: <Suspense fallback={<Loading />}><BorrowBookList /></Suspense>
    },
    {
        path: "borrow",
        element: <Suspense fallback={<Loading />}><Borrow /></Suspense>
    },
    {
        path: "membermanagement",
        element: <Suspense fallback={<Loading />}><MemberManagement /></Suspense>
    },
    {
        path: "eventmanagement",
        element: <Suspense fallback={<Loading />}><EventManagement /></Suspense>
    },
    {
        path: "ebookmanagement",
        element: <Suspense fallback={<Loading />}><EbookManagement /></Suspense>
    }

])

export default adminRouter