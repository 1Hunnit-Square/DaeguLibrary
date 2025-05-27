
import { Outlet } from "react-router-dom";


const QnaComponent = () => {
    return (
        <div style={{ padding: '20px' }}>
            {/* <Routes>
                <Route index element={<QnaListComponent />} />
                <Route path=":qno" element={<QnaDetailComponent />} />
                <Route path="new" element={<QnaNewComponent />} />
            </Routes> */}
            <Outlet />
        </div>
    );
};

export default QnaComponent;
