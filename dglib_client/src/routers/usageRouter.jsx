import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const ReadingRoom = lazy(() => import("../components/usage/ReadingRoomComponent"));
const MemberShip = lazy(() => import("../components/usage/MemberShipComponent"));
const BorrowReturn = lazy(() => import("../components/usage/BorrowReturnComponent"));






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
    }




])

export default usageRouter;