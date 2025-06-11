import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const BookRequest = lazy(() => import("../components/reservation/BookRequestComponent"));
const Program = lazy(() => import("../components/reservation/ProgramComponent"));
const ProgramDetail = lazy(() => import("../components/reservation/ProgramDetailComponent"));
const Facility = lazy(() => import("../components/reservation/FacilityComponent"));
const ApplyFacility = lazy(() => import("../components/reservation/ApplyFacilityComponent"));
const ApplyFacilityForm = lazy(() => import("../components/reservation/ApplyFacilityFormComponent"));
const Form = lazy(() => import("../components/reservation/BookRequestFormComponent"));




const reservationRouter = () => ([

    {
        path: "",
        element: <Navigate to="bookrequest" replace />
    },
    {
        path: "bookrequest",
        element: <Suspense fallback={<Loading />}><BookRequest /></Suspense>
    },
    {
        path: "program",
        element: <Suspense fallback={<Loading />}><Program /></Suspense>
    },
    {
        path: "program/:progNo",
        element: <Suspense fallback={<Loading />}><ProgramDetail /></Suspense>
    },
    {
        path: "facility",
        element: <Suspense fallback={<Loading />}><Facility /></Suspense>
    },
    {
        path: "facility/apply",
        element: <Suspense fallback={<Loading />}><ApplyFacility /></Suspense>
    },
    {
        path: "facility/apply/form",
        element: <Suspense fallback={<Loading />}><ApplyFacilityForm /></Suspense>
    },
    {
        path: "bookrequest/form",
        element: <Suspense fallback={<Loading />}><Form /></Suspense>
    }
])

export default reservationRouter;