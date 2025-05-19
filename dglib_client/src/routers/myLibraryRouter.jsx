import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const BorrowStatus = lazy(() => import("../components/myLibrary/BorrowStatusComponent"));


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
        path : "wishlist",
        element: <Suspense fallback={<Loading />}><BorrowStatus /></Suspense>
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