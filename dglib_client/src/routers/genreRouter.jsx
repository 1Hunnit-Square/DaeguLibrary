import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const GenreComponent = lazy(() => import("../components/main/GenreComponent"));

const genreRouter = () => ([

    {
        path : "",
        element: <Navigate to="literature" replace />
    },
    {
        path : ":genre",
        element: <Suspense fallback={<Loading />}><GenreComponent /></Suspense>
    },


])

export default genreRouter;