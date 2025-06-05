
import { Outlet } from "react-router-dom";


const QnAComponent = () => {
    return (
        <div style={{ padding: '20px' }}>
            {/* <Routes>
                <Route index element={<QnaListComponent />} />
                <Route path=":qno" element={<QnaDetailComponent />} />
                <Route path="new" element={<QnaNewComponent />} />
                <Route path="edit/:qno" element={<QnaEditComponent /} />
                <Route path="answer/:qno" element={<AnswerNewComponent /} />
                <Route path="answer/edit/:qno" element={<AnswerEditComponent /} />
            </Routes> */}
            <Outlet />
        </div>
    );
};

export default QnAComponent;
