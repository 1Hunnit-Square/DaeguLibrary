import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const BookSearch = lazy(() => import("../components/books/BookSearchComponent"));
const NewBook = lazy(() => import("../components/books/NewBookComponent"));
const Detail = lazy(() => import("../components/books/LibraryBookDetailComponent"));
const booksRouter = () => ([

    {
        path : "",
        element: <Navigate to="search" replace />
    },
    {
        path : "search",
        element: <Suspense fallback={<Loading />}><BookSearch /></Suspense>
    },
    {
        path: "new",
        element: <Suspense fallback={<Loading />}><NewBook /></Suspense>
    },
    {
        path: "detail/:librarybookid",
        element: <Suspense fallback={<Loading />}><Detail /></Suspense>
    }


])

export default booksRouter;

