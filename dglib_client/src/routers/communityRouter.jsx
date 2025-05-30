import { Children, Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import QnaListComponent from "../components/community/QnaListComponent";
import { path } from "framer-motion/client";
import QnaDetailComponent from "../components/community/QnaDetailComponent";
import QnaNewComponent from "../components/community/QnaNewComponent";

const Notice = lazy(() => import("../components/community/NoticeListComponent"));
const News = lazy(() => import("../components/community/NewsComponent"));
const Qna = lazy(() => import("../components/community/QnAComponent"));
const Gallery = lazy(() => import("../components/community/GalleryComponent"));
const Press = lazy(() => import("../components/community/PressComponent"));
const Donation = lazy(() => import("../components/community/DonationComponent"));
const NoticeDetail = lazy(() => import("../components/community/NoticeDetailComponent"));
const NoticeNew = lazy(() => import("../components/community/NoticeNewComponent"));


const communityRouter = () => ([

    {
        path: "",
        element: <Navigate to="notice" replace />
    },
    {
        path: "notice",
        element: <Suspense fallback={<Loading />}><Notice /></Suspense>
    },
    {
        path: "notice/:ano",
        element: <Suspense fallback={<Loading />}><NoticeDetail /></Suspense>
    },
     {
        path: "notice/new",
        element: <Suspense fallback={<Loading />}><NoticeNew /></Suspense>
    },
    {
        path: "news",
        element: <Suspense fallback={<Loading />}><News /></Suspense>

    },
    {
        path: "qna",
        element: <Suspense fallback={<Loading />}><Qna /></Suspense>,
        children:[
            {
                index: true, // 나중에  path: "" 이거와 비교하기
                element: <Suspense fallback={<Loading />}><QnaListComponent /></Suspense>
            },
            {
                path: ":qno",
                element: <Suspense fallback={<Loading />}><QnaDetailComponent /></Suspense>
            },
            {
                path: "new",
                element: <Suspense fallback={<Loading />}><QnaNewComponent /></Suspense>
            }
        ]
    },
    {
        path: "gallery",
        element: <Suspense fallback={<Loading />}><Gallery /></Suspense>

    },
    {
        path: "press",
        element: <Suspense fallback={<Loading />}><Press /></Suspense>

    },
    {
        path: "donation",
        element: <Suspense fallback={<Loading />}><Donation /></Suspense>
    }




])

export default communityRouter;