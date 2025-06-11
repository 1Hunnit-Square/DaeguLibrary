import {memo} from 'react';

const CheckNonLabel = ({ label, checked, onChange, checkboxClassName, inputClassName, disabled = false }) => {
  return (
    <div className={`flex w-max items-center ${checkboxClassName}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`accent-[#00893B] border-gray-300 rounded ${inputClassName}`}
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </div>
  );
}

export default memo(CheckNonLabel);