import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const Notice = lazy(() => import("../components/community/NoticeComponent"));
const News = lazy(() => import("../components/community/NewsComponent"));
const QnA = lazy(() => import("../components/community/QnAComponent"));
const Gallery = lazy(() => import("../components/community/GalleryComponent"));
const Press = lazy(() => import("../components/community/PressComponent"));
const Donation = lazy(() => import("../components/community/DonationComponent"));

const communityRouter = () => ([

    {
        path : "",
        element: <Navigate to="notice" replace />
    },
    {
        path : "notice",
        element: <Suspense fallback={<Loading />}><Notice /></Suspense>
    },
    {
        path : "news",
        element: <Suspense fallback={<Loading />}><News /></Suspense>

    },
    {
        path : "qna",
        element: <Suspense fallback={<Loading />}><QnA /></Suspense>

    },
    {
        path : "gallery",
        element: <Suspense fallback={<Loading />}><Gallery /></Suspense>

    },
    {
        path : "press",
        element: <Suspense fallback={<Loading />}><Press /></Suspense>

    },
    {
        path : "donation",
        element: <Suspense fallback={<Loading />}><Donation /></Suspense>
    }




])

export default communityRouter;