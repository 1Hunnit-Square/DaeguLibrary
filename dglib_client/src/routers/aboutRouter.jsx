import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";



const Greeting = lazy(() => import("../components/about/GreetingComponent"));
const Organization = lazy(() => import("../components/about/OrganizationComponent"));
const Loacation = lazy(() => import("../components/about/LocationComponent"));
const Policy = lazy(() => import("../components/about/PolicyComponent"));

const aboutRouter = () => ([

    {
        path : "",
        element: <Navigate to="greeting" replace />
    },
    {
        path : "greeting",
        element: <Suspense fallback={<Loading />}><Greeting /></Suspense>
    },
    {
        path : "organization",
        element: <Suspense fallback={<Loading />}><Organization /></Suspense>
    },
    {
        path : "policy",
        element: <Suspense fallback={<Loading />}><Policy /></Suspense>
    },
    {
        path : "location",
        element: <Suspense fallback={<Loading />}><Loacation /></Suspense>
    },



])

export default aboutRouter;