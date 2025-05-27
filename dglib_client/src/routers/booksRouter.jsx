import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

const BookSearch = lazy(() => import("../components/books/BookSearchComponent"));
const NewBook = lazy(() => import("../components/books/NewBookComponent"));
const Detail = lazy(() => import("../components/books/LibraryBookDetailComponent"));
const RecommendBook = lazy(() => import("../components/books/RecommendBookComponent"));
const TopBook = lazy(() => import("../components/books/TopBorrowedBookComponent"));
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
        path: "detail/:isbn",
        element: <Suspense fallback={<Loading />}><Detail /></Suspense>
    },
    {
        path: "recommend",
        element: <Suspense fallback={<Loading />}><RecommendBook /></Suspense>
    },
    {
        path: "top",
        element: <Suspense fallback={<Loading />}><TopBook /></Suspense>
    }


])

export default booksRouter;

