import {memo} from 'react';

const CheckBox = ({ label, checked, onChange, checkboxClassName, inputClassName }) => {
  return (
    <label className={`flex items-center ${checkboxClassName}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`accent-[#00893B] border-gray-300 rounded ${inputClassName}`}
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </label>
  );
}

export default memo(CheckBox);