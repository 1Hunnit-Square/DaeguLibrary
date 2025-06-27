import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import QuillToolbar from "./QuillToolbar";
import 'react-tooltip/dist/react-tooltip.css';
import Button from "./Button";
import DOMPurify from 'dompurify';
import CheckBox from "./CheckBox";
import { fileSize, getMimeType } from "../../util/commonUtil";
import { API_SERVER_HOST } from "../../api/config";
import { API_ENDPOINTS } from "../../api/config";
import { escapeHTML } from "../../util/commonUtil";
import _ from "lodash";
import Loading from "../../routers/Loading";

const MailQuillComponent = ({onParams, onBack, upload = ["file", "image"], searchHandler, useForm}) => {
  const quillRef = useRef(null);
  const imgRef = useRef(null);
  const fileRef = useRef(null);
  const [content, setContent ] = useState("");
  const [fileList, setFileList ] = useState([]);
  const [title, setTitle] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [toEmail, setToEmail] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [mailFocused, setMailFocused] = useState(false);
  const [ sendMe, setSendMe ] = useState(false);
  const [ sending, setSending ] = useState(false);

  const [ tooltip, setTooltip ] = useState({visible : false, content : ""});

useEffect(()=>{

  if(!_.isEmpty(useForm)){

    const head = useForm.sendType == "reply" ? "RE:" : "FW:";
    setTitle(head+useForm.subject);

    const from = useForm.fromName + " <"+useForm.fromEmail+">";
    const blockquote = `
    <blockquote><pre>
    ----- Original Mail -----
    From : ${escapeHTML(from)}
    Subject : ${escapeHTML(useForm.subject)}
    SentTime : ${useForm.sentTime}
    </pre></blockquote>
    ` 
    const editor = quillRef.current?.getEditor();
    editor.clipboard.dangerouslyPasteHTML("<br>"+blockquote || '');
    if(useForm.sendType == "reply"){
      setToEmail([from]);
    } else {
    if(editor){
    editor.clipboard.dangerouslyPasteHTML("<br>"+blockquote+useForm.content || '');
    }


    const mailFileList = useForm["fileList"]?.map(dto => {
      const file  = { name : dto.originalName, size : null, path : dto.filePath};
      const blobUrl = (!dto.fileType || dto.fileType == "image")? `${API_SERVER_HOST}${API_ENDPOINTS.mail}/view/${dto.filePath}` : null;
      return {file, blobUrl}
    });
    mailFileList && setFileList(mailFileList);
  }
  }

  

},[useForm])



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

const handleKeyDown = (e)=>{
    if (e.key === 'Backspace') {
     if(e.target.value == ""){
      setToEmail(prev => {
        const newArr = prev.slice(0,-1);
      return newArr;
    })
     }
}
}


const isEmptyQuill = (html) => {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["img"] });
  return clean.trim() === '';
};

const handleTitle = (e) => {
setTitle(e.target.value);
}

const inputToArray = (value) => {
  if(value == ""){
    return;
  }
  const addMail = value.includes(", ") ? value.split(", ")[0] : value.split(" ")[0];
  if(addMail?.split("<")[1]?.split(">")[0].trim()){
    setToEmail(prev => [...prev , addMail.split("<")[0]+" <"+addMail.split("<")[1].split(">")[0] +">"]);
  } else
  setToEmail(prev => [...prev , addMail]);
  setInputEmail(""); 
}

const handleToMail = (e) => {
  if(e.target.value.includes(" ") && e.target.value.trim()){
  inputToArray(e.target.value);
  
  } else
  setInputEmail(e.target.value.trim())
}

const urlToFile = async(filePath, fileName) => {
  const response = await fetch(filePath);
  const mimeType = getMimeType(fileName);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: mimeType });
  return file;
}


const handleClick = async() => {
  if(sending){
    alert("메일 전송 중입니다.");
    return ;
  }
     if(!title.trim()){
    alert("제목을 입력해주세요.");
    return ;
  }

  if(!sendMe && !toEmail.length){
    alert("수신 메일을 입력해주세요.");
    return ;
  }

  if(isEmptyQuill(content)){
    alert("내용을 입력해주세요.");
    return ;
  }

  setSending(true);

  const oldfileList = fileList.filter(file => file.file.size == null);
  const newfileList = fileList.filter(file => file.file.size != null);
  const files = newfileList.map(file => file.file);
  const urlList = newfileList.map(file => file.blobUrl);

  const paramData = new FormData();

  paramData.append("subject", title.trim());

  !sendMe && toEmail.forEach((to) => {
    paramData.append("to", to);  
  });

  let recontent = content;
  if(oldfileList?.length > 0){
    for (const oldFile of oldfileList) {
      const url = `${API_SERVER_HOST}${API_ENDPOINTS.mail}/view/${oldFile.file.path}`;
      const file = await urlToFile(url, oldFile.file.name)
      const blobUrl = oldFile.blobUrl ? URL.createObjectURL(file) : null;
      paramData.append("files", file);
      paramData.append("urlList", blobUrl);
      
      if(blobUrl != null){
      recontent = recontent.replaceAll(escapeHTML(url), blobUrl);
      }

    }

  }
  paramData.append("content", recontent);
  files.forEach((file) => {
    paramData.append("files", file);
  });
  urlList.forEach((url) => {
    paramData.append("urlList", url);
  });

  onParams(paramData, {setSending});

}

  const formats = useMemo(() => ["font", "size", "bold", "italic", "underline", "strike", "align",
  "list", "bullet", "link", "image", "clean",
  "color", "background","file"
 ], []);

    return (<div className="flex flex-col w-full">
      <div className="sticky top-0 z-50 bg-white pt-5 mb-7">
        <h1 className="text-3xl py-5 font-bold text-center text-[#00893B]">메일 쓰기</h1>
            <hr className="border-t border-gray-300 my-3" />
          <div className = "flex justify-between items-center gap-3 px-10 w-4xl mx-auto">
            <div className="flex gap-3">
            <Button onClick={handleClick}>전송</Button>
            {sendMe ? <Button onClick={()=>setSendMe(false)} className="bg-lime-600 hover:bg-lime-700">메일 쓰기</Button> :<Button onClick={()=>setSendMe(true)} className="bg-blue-500 hover:bg-blue-600">내게 쓰기</Button> }
            </div>
          <Button onClick={onBack} className="bg-gray-400 hover:bg-gray-500">닫기</Button>
          </div>
           <hr className="border-t border-gray-300 mt-3" />
           </div>
         <div className="flex flex-col mb-10 p-4 border border-gray-400 shadow-md rounded-xl bg-white max-w-4xl mx-auto">
          { !sendMe && <div className="flex gap-3 items-center mb-3">
          <div className = {`flex flex-wrap gap-2 pl-3 border border-gray-300 w-150 p-1 min-h-10 overflow-y-auto ${mailFocused ? "outline-1 outline-blue-300 rounded" : ""}`}>
          {toEmail.map((v,i) => <span key ={i} className="rounded-xl px-2 py-1 bg-blue-100 text-sm">{v}</span>)}
          <input className="text-sm outline-none flex-grow basis-0" placeholder={toEmail == "" ? `수신 메일을 입력하세요` : ""}
          value={inputEmail} onChange={handleToMail} onFocus={()=>setMailFocused(true)} onBlur={()=>{setMailFocused(false); inputToArray(inputEmail)}}  onKeyDown={handleKeyDown} /></div>
         <Button className="w-fit bg-emerald-500 hover:bg-emerald-600" onClick={() => searchHandler({setToEmail})}>이메일 검색</Button>
        </div>}
        <input className="text-sm border border-gray-300 p-1 w-200 h-10 pl-3 mr-2 mb-3 outline-blue-300" placeholder={"메일 제목을 입력하세요"}
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
              className = {`h-90 mb-3 border-1 border-gray-300 ${isFocused ? 'outline-2 outline-blue-300 rounded' : ''}`}
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
  

                </div>
                {sending && <Loading text="메일 전송중..." />}
           </div> 
    );
}

export default MailQuillComponent;

