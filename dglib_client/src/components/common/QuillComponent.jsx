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
import Loading from "../../routers/Loading";

const QuillComponent = ({onParams, onBack, useTitle, usePinned, usePublic, upload = ["file", "image"], modMap}) => {
  const quillRef = useRef(null);
  const imgRef = useRef(null);
  const fileRef = useRef(null);
  const [content, setContent ] = useState("");
  const [fileList, setFileList ] = useState([]);
  const [title, setTitle] = useState("");
  const [ pinned, setPinned ] = useState(false);
  const [ checkPublic, setCheckPublic ] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [ post, setPost ] = useState(false);

const [ tooltip, setTooltip ] = useState({visible : false, content : ""});

useEffect(()=>{

  if(modMap){
    const editor = quillRef.current?.getEditor();
    if(editor){
    editor.clipboard.dangerouslyPasteHTML(modMap.data.content || '');
    const length = editor.getLength();
    editor.setSelection(length, 0);
   
  }
    useTitle && setTitle(modMap.data.title);
    usePinned && setPinned(modMap.data.pinned);
    usePublic && setCheckPublic(modMap.data.checkPublic);
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

const handleClick = () => {
  if(post){
  alert("글을 등록 중입니다.");
  return;
}

  setPost(true);
  
     if(useTitle && !title.trim()){
    alert("제목을 입력해주세요.");
    setPost(false);
    return ;
  }

  if(isEmptyQuill(content)){
    alert("내용을 입력해주세요.");
    setPost(false);
    return ;
  }

  const oldfileList = fileList.filter(file => file.file.size == null);
  const newfileList = fileList.filter(file => file.file.size != null);
  const files = newfileList.map(file => file.file);
  const urlList = newfileList.map(file => file.blobUrl);

  const paramData = new FormData();

  useTitle && paramData.append("title", title.trim());
  paramData.append("content", contentReplace(content));
  files.forEach((file) => {
    paramData.append("files", file);
  });
  urlList.forEach((url) => {
    paramData.append("urlList", url);
  });
  oldfileList.forEach((file) => {
    paramData.append("oldFiles", file.file.path);
  });

  usePinned && paramData.append("pinned", pinned);
  usePublic && paramData.append("checkPublic", checkPublic);
  onParams(paramData,{setPost});

}


  const formats = useMemo(() => ["font", "size", "bold", "italic", "underline", "strike", "align",
  "list", "bullet", "link", "image", "clean",
  "color", "background","file"
 ], []);

    return (
        
         <div className="flex flex-col m-10 p-4 border rounded bg-white">
          <div className = "flex items-center gap-3 mb-3">
        {useTitle && <input className="text-sm border border-gray-300 p-1 w-200 h-10 pl-3 mr-2" placeholder={"제목을 입력하세요"}
        value = {title} onChange={handleTitle} />}
        {usePinned && <CheckBox label={"상단고정"} checkboxClassName={"whitespace-nowrap"} checked={pinned} onChange={()=>setPinned(!pinned)}/>}
        {usePublic && <>
        <label className="whitespace-nowrap">
          <input className="accent-green-600 mr-1" type="radio" name={"public"} value={true} checked={checkPublic} onChange={()=>setCheckPublic(true)}/>
          공개</label>
          <label className="whitespace-nowrap">
        <input className="accent-green-600 mr-1" type="radio" name={"public"} value={false} checked={!checkPublic} onChange={()=>setCheckPublic(false)}/>
        비공개</label></>}
        </div>
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
          <Button onClick={onBack} className="bg-gray-400 hover:bg-gray-500">돌아가기</Button>
          <Button onClick={handleClick}>글쓰기</Button>
          </div>
          {post && <Loading text ="글 등록 중..." /> }
            </div>

            
    );
}

export default QuillComponent;

