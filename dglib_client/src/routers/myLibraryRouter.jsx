import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const BorrowMember = lazy(() => import("../components/myLibrary/BorrowMemberComponent"));
const InterestBook = lazy(() => import("../components/myLibrary/InterestedComponent"));
const Detail = lazy(() => import("../components/books/LibraryBookDetailComponent"));
const ReserveBookMember = lazy(() => import("../components/myLibrary/BookReservationComponent"));
const BookRequest = lazy(() => import("../components/myLibrary/RequestComponent"));
const UseProgram = lazy(() => import("../components/myLibrary/UseProgramComponent"));
const UsedFacility = lazy(() => import("../components/myLibrary/UsedFacilityComponent"));
const Personalized = lazy(() => import("../components/myLibrary/PersonalizedComponent"));
const MyEbook = lazy(() => import("../components/myLibrary/MyEbookComponent"));


const myLibraryRouter = () => ([

    {
        path : "",
        element: <Navigate to="borrowstatus" replace />
    },
    {
        path : "borrowstatus",
        element: <Suspense fallback={<Loading />}><BorrowMember /></Suspense>
    },
    {
        path : "bookreservation",
        element: <Suspense fallback={<Loading />}><ReserveBookMember /></Suspense>
    },
    {
        path : "interested",
        element: <Suspense fallback={<Loading />}><InterestBook /></Suspense>
    },
    {
        path : "request",
        element: <Suspense fallback={<Loading />}><BookRequest /></Suspense>
    },
    {
        path : "useprogram",
        element: <Suspense fallback={<Loading />}><UseProgram /></Suspense>
    },
    {
        path : "usedfacility",
        element: <Suspense fallback={<Loading />}><UsedFacility /></Suspense>
    },
    {
        path : "personalized",
        element: <Suspense fallback={<Loading />}><Personalized /></Suspense>
    },
    {
        path: "detail/:isbn",
        element: <Suspense fallback={<Loading />}><Detail /></Suspense>
    },
    {
        path: "myebook",
        element: <Suspense fallback={<Loading />}><MyEbook /></Suspense>
    }




])

export default myLibraryRouter;