import React from "react";
import { Routes, Route } from "react-router-dom";
import QnaDetailComponent from "./QnaDetailComponent";
import QnaListComponent from "./QnaListComponent";
import { Outlet } from "react-router-dom";


const QnaComponent = () => {
    return (
        <div style={{ padding: '20px' }}>
            {/* <Routes>
                <Route index element={<QnaListComponent />} />
                <Route path=":qno" element={<QnaDetailComponent />} />
            </Routes> */}
            <Outlet />
        </div>
    );
};

export default QnaComponent;
