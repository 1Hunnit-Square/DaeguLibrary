import React, {memo} from 'react';
import Draggable from "react-draggable";

// 예시 : <Modal isOpen={isOpen} title={"제목"} onClose={handleClose} Confirm={"확인"} onConfirm={handleConfirm}> 내용 </Modal>

const Modal = ({ isOpen, title, children, onClose, Confirm, onConfirm, dragOn=true}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <Draggable handle={dragOn ? ".modal-header" : "dragOff"}>
        <div className="bg-white w-full pb-5 max-w-md mx-auto rounded-xl shadow-lg relative">
          <div className="modal-header bg-[#00893B] text-white px-4 py-2 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold">{title}</h2>
          {onClose && (<button
            onClick={onClose}
            className="text-white text-xl font-semibold leading-none hover:text-gray-200">
            X
          </button>)}
        </div>
        <div className="text-gray-700 p-5">
          {children}
        </div>
        {Confirm && (
            <button
            onClick={onClose}
            className="cursor-pointer mb-5 px-5 py-2 rounded text-black bg-gray-300 hover:bg-gray-400">
            {onConfirm}
          </button>)}
        </div>
        </Draggable>
    </div>
  );
}
  export default memo(Modal);