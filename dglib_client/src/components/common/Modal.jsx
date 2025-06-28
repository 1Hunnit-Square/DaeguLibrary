import {memo, useRef} from 'react';
import Draggable from "react-draggable";

// 예시 : <Modal isOpen={isOpen} title={"제목"} onClose={handleClose}> 내용 </Modal>

const Modal = ({ isOpen, title, children, onClose, dragOn=true, className=""}) => {
  if (!isOpen) return null;
  const nodeRef = useRef(null);

  return (
    <div className="fixed inset-0 z-150 bg-black/40 flex items-center justify-center">
        <Draggable nodeRef={nodeRef} handle={dragOn ? ".drag-handle" : "none"}>
        <div ref={nodeRef} className={`bg-white w-full pb-5 max-w-md mx-auto rounded-xl shadow-lg relative ${className}`}>
          <div className="bg-[#00893B] text-white px-4 py-2 flex justify-between items-center rounded-t-xl">
          <h2 className="drag-handle flex-1 text-xl font-semibold">{title}</h2>
          {onClose && (<button
            onClick={onClose}
            className="text-white text-xl font-semibold leading-none hover:text-gray-200 cursor-pointer">
            ✕
          </button>)}
        </div>
        <div className="text-gray-700 p-5">
          {children}
        </div>
        </div>
        </Draggable>
    </div>
  );
}
  export default memo(Modal);