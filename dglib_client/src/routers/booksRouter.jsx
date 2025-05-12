import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const BooksSearch = lazy(()=> import ("../pages/BooksSearch"));

const booksRouter = () => ([

    {
        path : "",
        element: <Navigate to="search" replace />
    },
    {
        path : "search",
        element: <Suspense fallback={<Loading />}><BooksSearch /></Suspense>
    }


])

export default booksRouter;

