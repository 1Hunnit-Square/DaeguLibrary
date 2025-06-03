import { useState, useRef, useEffect, useMemo } from "react";
import ReactQuill, {Quill} from "react-quill";
import 'react-quill/dist/quill.snow.css';
import Button from "../common/Button";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const Size = Quill.import("formats/size");
Size.whitelist = ["8px", "12px", "16px", "20px", "24px", "32px", "48px"];
Quill.register(Size, true);

const Image = Quill.import('formats/image');
Image.sanitize = (url) => url;

const CustomToolbar = ({tooltip}) => (
  <div id="toolbar" data-for="tip" className="flex gap-2 mb-4 border-b pb-2">
    <select className="ql-font">
  <option value="">기본</option>
  <option value="serif">Serif</option>
  <option value="monospace">Monospace</option>
</select>
   <select className="ql-size" defaultValue="16px">
   <option value="8px">8px</option>
  <option value="12px">12px</option>
  <option value="16px">16px</option>
  <option value="20px">20px</option>
  <option value="24px">24px</option>
   <option value="32px">32px</option>
    <option value="48px">48px</option>
</select>
<select title="글꼴색" className="ql-color" />
    <select title="배경색" className="ql-background" />
    <button title="굵게" className="ql-bold" />
    <button title="기울임" className="ql-italic" />
    <button title="밑줄" className="ql-underline" />
    <button title="취소선" className="ql-strike" />
    
    <button title="기호 목록" className="ql-list" value="bullet" />
    <button title="번호 목록" className="ql-list" value="ordered" />
   <button title="이미지 첨부" className="ql-image" />
    {/* 커스텀 버튼 */}
    <button title="파일 첨부" className="ql-file">
    <svg viewBox="0 0 24 24" width="18" height="18">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M16.5,6.5L9,14A3.5,3.5,0,0,0,14,19.5L21.5,12A6,6,0,0,0,13,4.5L5.5,12"
    />
  </svg></button>
  <button title="링크" id="link" className="ql-link" />
     <Tooltip
        anchorSelect="#link"
        isOpen={tooltip.visible}
        content={tooltip.visible ? "링크 : " + tooltip.content : ""}
        place="bottom"
        className="z-50 bg-gray-800 text-white text-sm rounded px-2 py-1 shadow-lg"
      />
  <button title="속성 지우기" className="ql-clean" />
  
  </div>
);


const NoticeNewComponent = () => {
  const quillRef = useRef(null);
  const imgRef = useRef(null);
  const fileRef = useRef(null);
const [content, setContent] = useState("");
const [ tooltip, setTooltip ] = useState({visible : false, content : ""});
const [imgList, setImgList ] = useState([]);
const [fileList, setFileList ] = useState([]);



function customLinkHandler() {
  const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection();

   if (!range || range.length === 0){
    alert("링크로 만들 텍스트를 선택해주세요.");
    return;
    }
    const format = editor.getFormat(range);
    const url = format.link? false : prompt("링크 주소를 입력하세요");
    editor.formatText(range.index, range.length, "link", url);
    setTooltip({ visible : !!url, content : url })


}



  const modules = useMemo(()=>({
  toolbar: {
    container: "#toolbar",
    handlers: {
      link: customLinkHandler, 
      image: () => imgRef.current?.click(),
      file : () => fileRef.current?.click()
    },
  },
}),[]);

const handleChange = () =>{
  const editor = quillRef.current?.getEditor();
  const range = editor?.getSelection();
  if(!range)
    return;
  const formats = editor.getFormat(range.index, range.length);
  const visible = !!formats.link;
  setTooltip({ visible, content : formats.link});


};

const handleImgChange = (e)=> {
  const file = e.target.files[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setImgList(prev => [...prev, { file, blobUrl}]);
    insertImg(blobUrl);
    e.target.value = null;
  
}

const handleFileChange = (e) => {
  const file = e.target.files[0];
    if (!file) return;
     setFileList(prev => [...prev, file]);
     console.log(file);
     e.target.value = null;
}

const insertImg = (url) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true); 
    editor.insertEmbed(range.index, "image", url);
    editor.setSelection(range.index + 1);
    console.log(blobUrl);

}

const deleteImg = (url, index) => {
  const editor = quillRef.current.getEditor();
  const delta = editor.getContents();
  const newOps = delta.ops.filter(op => !(op.insert && op.insert.image === url));
  editor.setContents({ ops: newOps });
  setImgList(prev => prev.filter((v, i) => i != index ));
}

const deleteFile = (index) => {
  setFileList(prev => prev.filter((v, i) => i != index ));
}

const fileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(2)} ${sizes[i]}`;
}



  const formats = ["font", "size", "bold", "italic", "underline", "strike",
  "list", "bullet", "link", "image", "clean",
  "color", "background","file"
];

    return (
        
         <div className="flex flex-col m-10 p-4 border rounded bg-white">
        <input className="border border-gray-300 p-1 mb-3 w-full" />
         <CustomToolbar tooltip={tooltip} />
        <ReactQuill
            theme="snow"
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder={"내용을 입력하세요"}
              onChangeSelection={handleChange}
              className = "h-80 mb-10"
              modules={modules}
              formats={formats}
            />
        <div>
          <input ref={imgRef} type="file" accept="image/*" className = "hidden" onChange={handleImgChange} />
          {imgList && imgList.map((img, index) => <div key={index} className="flex text-sm gap-1 items-center">첨부 이미지 {index+1} : {img.file.name}
              <span className="text-white bg-blue-300 rounded w-5 h-5 text-center cursor-pointer hover:bg-blue-400"
                onClick={()=> insertImg(img.blobUrl)}>+</span>
              <span className="text-white bg-red-300 rounded w-5 h-5 text-center cursor-pointer hover:bg-red-400"
              onClick={()=> deleteImg(img.blobUrl, index)}>x</span>
              </div>)}
            <input ref={fileRef} type="file" className = "hidden" onChange={handleFileChange} />
            {fileList && fileList.map((file, index) => <div key={index} className="flex text-sm gap-1 items-center">
              첨부 파일 {index+1} : {file.name} ({fileSize(file.size)})
              <span className="text-white bg-red-300 rounded w-5 h-5 text-center cursor-pointer hover:bg-red-400"
              onClick={()=> deleteFile(index)}>x</span>
              </div>)}
         </div>

         <Button className="w-30 mx-auto" onClick={()=>console.log(content)}>글쓰기</Button>
            </div>

            
    );
}

export default NoticeNewComponent;

