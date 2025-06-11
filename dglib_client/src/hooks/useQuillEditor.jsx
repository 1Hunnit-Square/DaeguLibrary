import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const useQuillEditor = (
  initialValue = "",
  placeholder = "내용을 입력해주세요..."
) => {
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    const styleId = "quill-editor-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    //스타일코드아래추가
    style.innerHTML = `

    `;
    //https://blaxsior-repository.tistory.com/237 스크롤 참고할꺼임
    document.head.appendChild(style);
  }, []);

  const QuillComponent = (
    <ReactQuill
      value={content}
      onChange={setContent}
      placeholder={placeholder}
    />
  );

  return { content, setContent, QuillComponent };
};

export default useQuillEditor;