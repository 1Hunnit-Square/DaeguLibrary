import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import QuillToolbar from "./QuillToolbar";
import 'react-tooltip/dist/react-tooltip.css';
import Button from "./Button";
import DOMPurify from 'dompurify';
import CheckBox from "./CheckBox";
import { fileSize } from "../../util/commonUtil";
import { API_SERVER_HOST } from "../../api/config";
import { API_ENDPOINTS } from "../../api/config";
import { contentReplace } from "../../util/commonUtil";

const MailQuillComponent = ({onParams, onBack, upload = ["file", "image"], modMap}) => {
  const quillRef = useRef(null);
  const imgRef = useRef(null);
  const fileRef = useRef(null);
  const [content, setContent ] = useState("");
  const [fileList, setFileList ] = useState([]);
  const [title, setTitle] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

const [ tooltip, setTooltip ] = useState({visible : false, content : ""});

useEffect(()=>{

  if(modMap){
    const editor = quillRef.current?.getEditor();
    if(editor){
    editor.clipboard.dangerouslyPasteHTML(modMap.data.content || '');
    const length = editor.getLength();
    editor.setSelection(length, 0);
   
  }
    setTitle(modMap.data.title);

    const modFileList = modMap.data[modMap.fileDTOName]?.map(dto => {
      const file  = { name : dto.originalName, size : null, path : dto.filePath};
      const blobUrl = (!dto.fileType || dto.fileType == "image")? `${API_SERVER_HOST}${API_ENDPOINTS.view}/${dto.filePath}` : null;
      return {file, blobUrl}
    });
    modFileList && setFileList(modFileList);
  }

},[])



const linkHandler = () => {
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
      link: linkHandler, 
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
   console.log(file);
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setFileList(prev => [...prev, { file, blobUrl}]);
    insertImg(blobUrl);
    imgRef.current.value = '';
  
}

const handleFileChange = (e) => {
  const file = e.target.files[0];
    if (!file) return;
     setFileList(prev => [...prev, { file, blobUrl : null}]);
     console.log(file);
     fileRef.current.value = '';
}

const insertImg = (url) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true); 
    editor.insertEmbed(range.index, "image", url);
    editor.setSelection(range.index + 1);
    console.log(url);

}

const deleteFile = (url, index) => {
  if(url != null) {
  const editor = quillRef.current.getEditor();
  const delta = editor.getContents();
  const newOps = delta.ops.filter(op => !(op.insert && op.insert.image === url));
  editor.setContents({ ops: newOps });
  }
  setFileList(prev => prev.filter((v, i) => i != index ));
}



const isEmptyQuill = (html) => {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["img"] });
  return clean.trim() === '';
};

const handleTitle = (e) => {
setTitle(e.target.value);
}

const handleToMail = (e) => {
setToEmail(e.target.value);
}

const handleClick = () => {
     if(!title.trim()){
    alert("제목을 입력해주세요.");
    return ;
  }

  if(isEmptyQuill(content)){
    alert("내용을 입력해주세요.");
    return ;
  }

  const oldfileList = fileList.filter(file => file.file.size == null);
  const newfileList = fileList.filter(file => file.file.size != null);
  const files = newfileList.map(file => file.file);
  const urlList = newfileList.map(file => file.blobUrl);

  const paramData = new FormData();

  paramData.append("subject", title.trim());
  paramData.append("to", toEmail.trim());
  paramData.append("content", contentReplace(content));
  // files.forEach((file) => {
  //   paramData.append("files", file);
  // });
  // urlList.forEach((url) => {
  //   paramData.append("urlList", url);
  // });
  // oldfileList.forEach((file) => {
  //   paramData.append("oldFiles", file.file.path);
  // });

  onParams(paramData);

}


  const formats = useMemo(() => ["font", "size", "bold", "italic", "underline", "strike", "align",
  "list", "bullet", "link", "image", "clean",
  "color", "background","file"
 ], []);

    return (
        
         <div className="flex flex-col mt-10 p-4 border rounded bg-white">
          <div className="flex gap-2 items-center mb-3">
          <input className="text-sm border border-gray-300 p-1 w-100 h-10 pl-3 mr-2" placeholder={"수신 메일을 입력하세요"}
          value={toEmail} onChange={handleToMail} />
         <Button>이메일 검색</Button>
        </div>
        <input className="text-sm border border-gray-300 p-1 w-200 h-10 pl-3 mr-2 mb-3" placeholder={"메일 제목을 입력하세요"}
        value={title} onChange={handleTitle} />
       
         <QuillToolbar tooltip={tooltip} upload={upload} />
        <ReactQuill
            theme="snow"
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder={"내용을 입력하세요"}
              onChangeSelection={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className = {`h-90 mb-3 border-1 border-gray-300 ${isFocused ? 'outline-2 rounded' : ''}`}
              modules={modules}
              formats={formats}
            />
        <div>
          <input ref={imgRef} type="file" accept="image/*" className = "hidden" onChange={handleImgChange} />
          <input ref={fileRef} type="file" className = "hidden" onChange={handleFileChange} />
          {fileList && fileList.map((file, index) => <div key={index} className="flex my-1 text-sm gap-1 items-center border border-gray-300 p-2">
             <span className="font-semibold">첨부 파일 ({index+1})</span> <span className="mx-1">{file.file.name}{!file.blobUrl && <> {fileSize(file.file.size)} </>}</span> 
              {file.blobUrl && <span className="text-white bg-blue-300 px-1 rounded text-center cursor-pointer hover:bg-blue-400"
                onClick={()=> insertImg(file.blobUrl)}>첨부</span>}
              <span className="text-white bg-red-300 px-1 rounded text-center cursor-pointer hover:bg-red-400"
              onClick={()=> deleteFile(file.blobUrl, index)}>삭제</span>
              </div>)}
         </div>
         <div className = "flex justify-end items-center mt-3 gap-2">
          <Button onClick={onBack} className="bg-gray-400 hover:bg-gray-500">닫기</Button>
          <Button onClick={handleClick}>전송</Button>
          </div>
            </div>

            
    );
}

export default MailQuillComponent;

