import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

const RegBook = lazy(() => import("../components/admin/RegBookComponent"));
const BorrowBook = lazy(() => import("../components/admin/BorrowBookComponent"));
const BorrowBookList = lazy(() => import("../components/admin/BorrowBookListComponent"));
const Borrow = lazy(() => import("../components/admin/BorrowComponent"));
const BookManagement = lazy(() => import("../components/admin/BookManagementComponent"));
const MemberManagement = lazy(() => import("../components/admin/MemberManagementComponent"));
const CalendarManagement = lazy(() => import("../components/admin/CalendarManagementComponent"));
const EbookManagement = lazy(() => import("../components/admin/EbookManagementComponent"));
const BannerManagement = lazy(() => import("../components/admin/BannerManagementComponent"));
const BoardManagement = lazy(() => import("../components/admin/BoardManagementComponent"));
const MessengerManagement = lazy(() => import("../components/admin/MessengerComponent"));
const StatsManagement = lazy(() => import("../components/admin/StatsManagementComponent"));
const ProgManagement = lazy(() => import("../components/admin/ProgManagementComponent"));
const ProgramAdminDetail = lazy(() => import("../components/admin/ProgramAdminDetailComponent"));
const ProgramRegister = lazy(() => import("../components/admin/ProgramRegisterComponent"));




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
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><MemberManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "calendarmanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><CalendarManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "ebookmanagement",
        element: <Suspense fallback={<Loading />}><EbookManagement /></Suspense>
    },
    {
        path: "bannermanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><BannerManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "boardmanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><BoardManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "messengermanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><MessengerManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "statsmanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><StatsManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "progmanagement",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><ProgManagement /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "progmanagement/programdetail/:progNo",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><ProgramAdminDetail /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "programregister",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><ProgramRegister /></Suspense></ProtectedAdminRoute>
    },
    {
        path: "progmanagement/programregister/:progNo",
        element: <ProtectedAdminRoute><Suspense fallback={<Loading />}><ProgramRegister /></Suspense></ProtectedAdminRoute>
    }



])

export default adminRouter