import {memo} from 'react';

const Button = ({ children, onClick, className = '', disabled }) => (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 bg-[#00893B] text-white rounded hover:bg-[#006C2D] ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );

export default memo(Button);