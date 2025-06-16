import { Children, Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";


const Notice = lazy(() => import("../components/community/NoticeListComponent"));
const NoticeDetail = lazy(() => import("../components/community/NoticeDetailComponent"));
const NoticeNew = lazy(() => import("../components/community/NoticeNewComponent"));
const NoticeMod = lazy(() => import("../components/community/NoticeModComponent"));

const Event = lazy(()=>import("../components/community/EventListComponent"));
const EventDetail = lazy(()=>import("../components/community/EventDetailComponent"));
const EventNew = lazy(()=>import("../components/community/EventNewComponent"));
const EventMod = lazy(()=>import("../components/community/EventModComponent"));

const News = lazy(() => import("../components/community/NewsListComponent"));
const NewsNew = lazy(() => import("../components/community/NewsNewComponent"));
const NewsDetail = lazy(() => import("../components/community/NewsDetailComponent"));
const NewsMod = lazy(() => import("../components/community/NewsModComponent"));

const Qna = lazy(() => import("../components/community/QnaListComponent"));
const QnaDetail = lazy(() => import("../components/community/QnaDetailComponent"));
const QnaNew = lazy(() => import("../components/community/QnaNewComponent"));
const QnaMod = lazy(() => import("../components/community/QnaEditComponent"));

const AnswerNew = lazy(()=>import("../components/community/AnswerNewComponent"));
const AnswerMod = lazy(()=>import("../components/community/AnswerEditComponent"));

const Gallery = lazy(() => import("../components/community/GalleryListComponent"));
const GalleryDetail = lazy(() => import("../components/community/GalleryDetailComponent"));
const GalleryNew = lazy(() => import("../components/community/GalleryNewComponent"));
const GalleryMod = lazy(() => import("../components/community/GalleryModComponent"));

const Donation = lazy(() => import("../components/community/DonationComponent"));


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
        path: "notice/edit/:ano",
        element: <Suspense fallback={<Loading />}><NoticeMod /></Suspense>
    },

    {
        path: "event",
        element: <Suspense fallback={<Loading />}><Event /></Suspense>

    },
    {
        path: "event/:eno",
        element: <Suspense fallback={<Loading />}><EventDetail /></Suspense>
    },
    {
        path: "event/new",
        element: <Suspense fallback={<Loading />}><EventNew /></Suspense>
    },
    {
        path: "event/edit/:eno",
        element: <Suspense fallback={<Loading />}><EventMod /></Suspense>
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
        element: <Suspense fallback={<Loading />}><Qna /></Suspense>
    },
    {
        path: "qna/:qno",
        element: <Suspense fallback={<Loading />}><QnaDetail /></Suspense>
    },
    {
        path: "qna/new",
        element: <Suspense fallback={<Loading />}><QnaNew /></Suspense>
    },
    {
        path: "qna/edit/:qno",
        element: <Suspense fallback={<Loading />}><QnaMod /></Suspense>
    },
     {
        path: "qna/answer/:qno",
        element: <Suspense fallback={<Loading />}><AnswerNew /></Suspense>
    },
    {
        path: "qna/answer/edit/:qno",
        element: <Suspense fallback={<Loading />}><AnswerMod /></Suspense>
    },

    {
        path: "gallery",
        element: <Suspense fallback={<Loading />}><Gallery /></Suspense>
    },
    {
        path: "gallery/:gno",
        element: <Suspense fallback={<Loading />}><GalleryDetail /></Suspense>
    },
    {
        path: "gallery/new",
        element: <Suspense fallback={<Loading />}><GalleryNew /></Suspense>
    },
    {
        path: "gallery/edit/:gno",
        element: <Suspense fallback={<Loading />}><GalleryMod /></Suspense>
    },
    
    {
        path: "donation",
        element: <Suspense fallback={<Loading />}><Donation /></Suspense>
    }




])

export default communityRouter;