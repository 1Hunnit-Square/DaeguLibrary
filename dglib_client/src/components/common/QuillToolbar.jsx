import { Quill } from "react-quill";
import { Tooltip } from 'react-tooltip';

const Size = Quill.import("formats/size");
Size.whitelist = ["8px", "12px", "16px", "20px", "24px", "32px", "48px"];
Quill.register(Size, true);

const Image = Quill.import('formats/image');
Image.sanitize = (url) => url;

const Align = Quill.import('formats/align');
Align.whitelist = ['right', 'center'];
Quill.register(Align, true);

const Font = Quill.import("formats/font");
Font.whitelist = ["serif", "monospace", "nanumsquare", "maruburi", "yeonsung","jua"];
Quill.register(Font, true);


const QuillToolbar = ({ tooltip, upload }) => (
  <div id="toolbar" data-for="tip" className="flex gap-2 mb-4 border-b pb-2">
    <select className="ql-font !w-35" defaultValue="">
      <option value="">기본</option>
      <option value="serif">Serif</option>
      <option value="monospace">Monospace</option>
      <option value="nanumsquare">나눔스퀘어</option>
      <option value="maruburi">마루부리</option>
      <option value="yeonsung">연성체</option>
      <option value="jua">주아체</option>
     
      
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
    <select title="정렬" className="ql-align">
      <option value=""></option>
      <option value="center"></option>
      <option value="right"></option>
    </select>

    <button title="기호 목록" className="ql-list" value="bullet" />
    <button title="번호 목록" className="ql-list" value="ordered" />
    {upload.includes("image") && <button title="이미지 첨부" className="ql-image" />}
    {/* 커스텀 버튼 */}
    {upload.includes("file") && <button title="파일 첨부" className="ql-file">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M16.5,6.5L9,14A3.5,3.5,0,0,0,14,19.5L21.5,12A6,6,0,0,0,13,4.5L5.5,12"
        />
      </svg></button>}
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

export default QuillToolbar;