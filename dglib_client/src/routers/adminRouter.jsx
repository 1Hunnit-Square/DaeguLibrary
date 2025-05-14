import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const RegBook = lazy(() => import("../components/admin/RegBookComponent"));


const adminRouter = () => ([
    {
        path: "",
        element: <Navigate to="regbook" replace />
    },
    {
        path: "regbook",
        element: <Suspense fallback={<Loading />}><RegBook /></Suspense>
    }

])

export default adminRouter