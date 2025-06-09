import { Children, Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import QnaListComponent from "../components/community/QnaListComponent";
import { path } from "framer-motion/client";
import QnaDetailComponent from "../components/community/QnaDetailComponent";
import QnaNewComponent from "../components/community/QnaNewComponent";
import QnaEditComponent from "../components/community/QnaEditComponent";
import AnswerNewComponent from "../components/community/AnswerNewComponent";
import AnswerEditComponent from "../components/community/AnswerEditComponent";
import NewsListComponent from "../components/community/NewsListComponent";
import NewsNewComponent from "../components/community/NewsNewComponent";

const Notice = lazy(() => import("../components/community/NoticeListComponent"));
const News = lazy(() => import("../components/community/NewsListComponent"));
const NewsNew = lazy(() => import("../components/community/NewsNewComponent"));
const NewsDetail = lazy(() => import("../components/community/NewsDetailComponent"));
const NewsMod = lazy(() => import("../components/community/NewsModComponent"));
const Qna = lazy(() => import("../components/community/QnaComponent"));
const Gallery = lazy(() => import("../components/community/GalleryComponent"));
const Donation = lazy(() => import("../components/community/DonationComponent"));
const NoticeDetail = lazy(() => import("../components/community/NoticeDetailComponent"));
const NoticeNew = lazy(() => import("../components/community/NoticeNewComponent"));
const NoticeMod = lazy(() => import("../components/community/NoticeModComponent"));

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
        path: "notice/edit/:nno",
        element: <Suspense fallback={<Loading />}><NoticeMod /></Suspense>
    },
    {
        path: "news",
        element: <Suspense fallback={<Loading />}><News /></Suspense>

    },
    {
        path: "news/:nno",
        element: <Suspense fallback={<Loading />}><NewsDetail /></Suspense>
    },
    {
        path: "news/new",
        element: <Suspense fallback={<Loading />}><NewsNew /></Suspense>
    },
    {
        path: "news/edit/:nno",
        element: <Suspense fallback={<Loading />}><NewsMod /></Suspense>
    },
    {
        path: "qna",
        element: <Suspense fallback={<Loading />}><Qna /></Suspense>,
        children: [
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
            },
            {
                path: "edit/:qno",
                element: <Suspense fallback={<Loading />}><QnaEditComponent /></Suspense>
            },
            {
                path: "answer/:qno",
                element: <Suspense fallback={<Loading />}><AnswerNewComponent /></Suspense>
            },
            {
                path: "answer/edit/:qno",
                element: <Suspense fallback={<Loading />}><AnswerEditComponent /></Suspense>
            }
        ]
    },
    {
        path: "gallery",
        element: <Suspense fallback={<Loading />}><Gallery /></Suspense>

    },
    {
        path: "donation",
        element: <Suspense fallback={<Loading />}><Donation /></Suspense>
    }




])

export default communityRouter;