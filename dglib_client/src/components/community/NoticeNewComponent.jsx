import { useState, useRef, useEffect, useMemo } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import Button from "../common/Button";

const CustomToolbar = () => (
  <div id="toolbar" className="flex gap-2 mb-4 border-b pb-2">
    <select className="ql-header" defaultValue={""}>
      <option value="1">헤더1</option>
      <option value="2">헤더2</option>
      <option value="3">헤더3</option>
      <option value="">기본</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-strike" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <select className="ql-color" />
    <select className="ql-background" />
    <button className="ql-link" />
    <button className="ql-image" />
    <button className="ql-clean" />
    {/* 여기 커스텀 버튼도 추가 가능 */}
    <button className="ql-customButton">⭐</button>
  </div>
);


const LinkTooltip = ({ top, left, link }) => (
  <div
    className="absolute bg-gray-800 text-white px-2 py-1 text-sm rounded z-50"
    style={{ top, left }}
  >
    🔗 {link}
  </div>
);

const NoticeNewComponent = () => {
const [content, setContent] =useState("ddd");
const quillRef = useRef(null);
  const [tooltip, setTooltip] = useState({ top: 0, left: 0, link: "" });

function customLinkHandler() {
  const editor = quillRef.current.getEditor();
    const range = editor.getSelection();

   if (!range || range.length === 0){
    alert("링크로 만들 텍스트를 선택해주세요.");
    return;
    }
    const format = editor.getFormat(range);
    const url = format.link? false : prompt("링크 주소를 입력하세요");
    editor.formatText(range.index, range.length, "link", url);


}

  const modules = useMemo(()=>({
  toolbar: {
    container: "#toolbar",
    handlers: {
      link: customLinkHandler,  // 여기서 함수 참조
    },
  },
}),[]);



 useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const editorContainer = quillRef.current?.editor?.container;
    if (!editor || !editorContainer) return;

    const editorDiv = editorContainer.querySelector(".ql-editor");

    const handleClick = () => {
      const range = editor.getSelection();
      if (!range || range.length > 0) {
        setTooltip(null);
        return;
      }

      const format = editor.getFormat(range.index);
      if (format.link) {
        // 위치 찾기
        const leafNode = editorDiv?.childNodes[0]?.ownerDocument?.getSelection()?.anchorNode?.parentElement;
        const rect = leafNode?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX,
            link: format.link,
          });
        }
      } else {
        setTooltip(null);
      }
    };

    editorDiv?.addEventListener("click", handleClick);
    return () => editorDiv?.removeEventListener("click", handleClick);
  }, []);


  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "link", "image", "clean"
  ];

    return (
        
         <div className="flex flex-col m-10 p-4 border rounded bg-white">
        <input className="border border-gray-300 p-1 mb-3 rounded w-full" />
        {tooltip && <LinkTooltip x={tooltip.x} y={tooltip.y} link={tooltip.link} />}
         <CustomToolbar />
        <ReactQuill
            theme="snow"
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder={"내용을 입력하세요"}
              className = "h-80 mb-15"
              modules={modules}
              formats={formats}
            />
        <div><Button onClick={()=>alert("!")}>버튼</Button></div>
            </div>

            
    );
}

export default NoticeNewComponent;

