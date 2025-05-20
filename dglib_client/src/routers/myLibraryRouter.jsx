import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const BorrowStatus = lazy(() => import("../components/myLibrary/BorrowStatusComponent"));
const InterestBook = lazy(() => import("../components/myLibrary/InterestedComponent"));


const myLibraryRouter = () => ([

    {
        path : "",
        element: <Navigate to="borrowstatus" replace />
    },
    {
        path : "borrowstatus",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    },
    {
        path : "bookreservation",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    },
    {
        path : "interested",
        element: <Suspense fallback={<Loading />}><InterestBook /></Suspense>
    },
    {
        path : "request",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    },
    {
        path : "useprogram",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    },
    {
        path : "usedfacility",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    },
    {
        path : "personalized",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
    }



])

export default myLibraryRouter;