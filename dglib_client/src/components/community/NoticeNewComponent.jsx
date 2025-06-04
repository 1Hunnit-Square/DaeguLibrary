import { useState, useRef, useEffect, useMemo } from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-tooltip/dist/react-tooltip.css';
import QuillComponent from "../common/QuillComponent";
import { regNotice } from "../../api/noticeApi";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";


const NoticeNewComponent = () => {

const navigate = useNavigate();
const mid = useRecoilValue(memberIdSelector);

const sendParams = (paramData) => {

paramData.append("mid", mid);
console.log(paramData);


regNotice(paramData).then(res => {
  alert("글을 등록하였습니다.");
  navigate("/community/notice");

}).catch(error => {
  alert("글 등록에 실패했습니다.");
  console.error(error);
})
}

const onBack = () => {
  navigate(-1);
}

    return (
        <div className = "flex flex-col justify-center bt-5 mb-10">
      <QuillComponent onParams={sendParams} onBack={onBack} useTitle={true} usePinned={true} usePublic={false} />
     
     </div>     
    );
}

export default NoticeNewComponent;

