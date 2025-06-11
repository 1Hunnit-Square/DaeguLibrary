import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";

const Loading = <div>페이지 불러오는중...</div>
const GenreComponent = lazy(() => import("../components/GenreComponent"));
const genreRouter = () => ([

    {
        path : "",
        element: <Navigate to="literature" replace />
    },
    {
        path : ":genre",
        element: <Suspense fallback={Loading}><GenreComponent /></Suspense>
    },
    

])

export default genreRouter; 