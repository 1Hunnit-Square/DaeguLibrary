import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuestion } from "../../hooks/useQuestionMutation";
import QuillComponent from "../common/QuillComponent";

const QnaNewComponent = () => {
  const navigate = useNavigate();
  const createQuestionMutation = useCreateQuestion();

  const sendParams = (paramData, post) => {
    const title = paramData.get("title");
    const content = paramData.get("content");
    const checkPublic = paramData.get("checkPublic") === "true";

    createQuestionMutation.mutate({
      title,
      content,
      checkPublic,
    },{
    onSettled: () => {
      post.setPost(false);
    }});
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col justify-center bt-5 mb-10">
      <QuillComponent
        onParams={sendParams}
        onBack={onBack}
        useTitle={true}
        usePinned={false}
        usePublic={true}
        upload={[]}
      />
    </div>
    // <div className="max-w-3xl mx-auto p-4">
    //   <h2 className="text-xl font-bold mb-6">문의하기</h2>

    //   <div className="mb-4">
    //     <label className="font-semibold">제목</label>
    //     <input
    //       type="text"
    //       value={title}
    //       onChange={(e) => setTitle(e.target.value)}
    //       className="w-full border border-gray-300 p-2 mt-1"
    //       placeholder="50자 이내 제목을 입력해주세요"
    //     />
    //   </div>

    //   <div className="mb-4">
    //     <label className="font-semibold">공개여부</label>
    //     <div className="mt-1">
    //       <label className="mr-4">
    //         <input
    //           type="radio"
    //           name="checkPublic"
    //           checked={checkPublic === true}
    //           onChange={() => setCheckPublic(true)}
    //         />{" "}
    //         공개
    //       </label>
    //       <label>
    //         <input
    //           type="radio"
    //           name="checkPublic"
    //           checked={checkPublic === false}
    //           onChange={() => setCheckPublic(false)}
    //         />{" "}
    //         비공개
    //       </label>
    //     </div>
    //   </div>

    //   <div className="mb-4">
    //     <label className="font-semibold">질문 내용</label>
    //     {QuillComponent}
    //   </div>

    //   <div className="flex justify-end gap-2">
    //     <button
    //       className="px-4 py-2 bg-gray-400 text-white rounded"
    //       onClick={() => navigate(-1)}
    //     >
    //       돌아가기
    //     </button>
    //     <button
    //       className="px-4 py-2 bg-[#00893B] text-white rounded"
    //       onClick={handleSubmit}
    //     >
    //       등록하기
    //     </button>
    //   </div>
    // </div>
  );
};

export default QnaNewComponent;
