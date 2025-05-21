import React from "react";
import { Routes, Route } from "react-router-dom";
import QnaList from "../../pages/qna/QnaList";
import QnaDetail from "../../pages/qna/QnaDetail";

const QnAComponent = () => {
    return (
        <div style={{ padding: '20px' }}>
            <Routes>
                <Route path="/" element={<QnaList />} />
                <Route path=":qno" element={<QnaDetail />} />
            </Routes>
        </div>
    );
};

export default QnAComponent;
