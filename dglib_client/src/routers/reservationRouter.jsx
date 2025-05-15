import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const BookRequest = lazy(() => import("../components/reservation/BookRequestComponent"));
const Program = lazy(() => import("../components/reservation/ProgramComponent"));


const reservationRouter = () => ([

    {
        path : "",
        element: <Navigate to="bookrequest" replace />
    },
    {
        path : "bookrequest",
        element: <Suspense fallback={<Loading />}><BookRequest /></Suspense>
    },
    {
        path : "program",
        element: <Suspense fallback={<Loading />}><Program /></Suspense>
    },
    {
        path : "facility",
        element: <Suspense fallback={<Loading />}><Program /></Suspense>
    }




])

export default reservationRouter;