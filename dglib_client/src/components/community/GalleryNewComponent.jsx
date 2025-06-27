import { useState, useRef, useEffect, useMemo } from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-tooltip/dist/react-tooltip.css';
import QuillComponent from "../common/QuillComponent";
import { regGallery } from "../../api/galleryApi";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";

const GalleryNewComponent = () => {
    const { moveToLogin } = useMoveTo();
    const navigate = useNavigate();
    const mid = useRecoilValue(memberIdSelector);
    const role = useRecoilValue(memberRoleSelector);

    const sendParams = (paramData, post) => {
        paramData.append("mid", mid);
        console.log(paramData);

        if (!paramData.get("files")) {
            alert("이미지를 반드시 첨부해야합니다.");
            post.setPost(false);
            return;
        }
        regGallery(paramData).then(res => {
            alert("글을 등록하였습니다.");
            navigate("/community/gallery");
        }).catch(error => {
            alert("글 등록에 실패했습니다.");
            console.error(error);
        }).finally(() => {
            post.setPost(false);
        })
    };

    const onBack = () => {
        navigate(-1);
    };

    useEffect(() => {

        if (!mid) {
            moveToLogin();
            return;
        }

        if (role != "ADMIN") {
            alert("글쓰기 권한이 없습니다.");
            navigate("/community/notice", { replace: true });
        }

    }, []);

    return (
        <div className="flex flex-col justify-center bt-5 mb-10">
            {mid && (
                <QuillComponent
                    onParams={sendParams}
                    onBack={onBack}
                    useTitle={true}
                    usePublic={false}
                    upload={["image"]}
                />
            )}
        </div>
    );
};

export default GalleryNewComponent;
