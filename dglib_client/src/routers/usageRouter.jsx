import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const ReadingRoom = lazy(() => import("../components/usage/ReadingRoomComponent"));
const MemberShip = lazy(() => import("../components/usage/MemberShipComponent"));
const BorrowReturn = lazy(() => import("../components/usage/BorrowReturnComponent"));
const Calendar = lazy(() => import("../components/usage/CalendarComponent"));
const MemberSearch = lazy(() => import("../components/admin/MemberSearchComponent"));






const usageRouter = () => ([

    {
        path : "",
        element: <Navigate to="readingroom" replace />
    },
    {
        path : "readingroom",
        element: <Suspense fallback={<Loading />}><ReadingRoom /></Suspense>
    },
    {
        path : "membership",
        element: <Suspense fallback={<Loading />}><MemberShip /></Suspense>
    },
    {
        path : "borrowreturn",
        element: <Suspense fallback={<Loading />}><BorrowReturn /></Suspense>
    },
    {
        path : "calendar",
        element: <Suspense fallback={<Loading />}><Calendar /></Suspense>
    }




])

export default usageRouter;