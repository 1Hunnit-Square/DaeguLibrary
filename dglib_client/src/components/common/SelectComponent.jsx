import { useState, useEffect, useRef, memo } from "react";
import { FiChevronDown } from 'react-icons/fi';


const SelectComponent = ({
  options = [],
  dropdownClassName = "",
  selectClassName = "",
  selectStyle = {},
  dropdownStyle = {},
  onChange,
  value,
  disabled = false,
  name = "",
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const objIsArray = Array.isArray(options);

  const handleSelectOption = (option) => {
    setIsOpen(false);
    onChange(option);
  };




  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
      <div className="relative mr-2" ref={dropdownRef}>
        <button
          type="button"
          style={selectStyle}
          className={`flex z-101 relative items-center justify-between w-32 px-4 py-2 rounded-2xl bg-white border border-[#00893B] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}  ${selectClassName}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {objIsArray &&<span>{value}</span>}
          {!objIsArray && <span>{Object.keys(options).filter(key => options[key] === value)[0]}</span>}
          <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div
          style={dropdownStyle}
          className={`absolute z-100 -mt-4 bg-white border dropdownClassName border-[#00893B] rounded-lg shadow-lg w-full ${dropdownClassName}`}>
            {objIsArray && options.map((option, index) => (
              <div
                key={index}
                className={`py-2 px-4 text-left  cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-emerald-700 rounded-lg ${index === 0 ? 'mt-3' : ''}`}
                onClick={() => handleSelectOption(option)}
                name={name}
              >
                {option}
              </div>
            ))}

            {!objIsArray && Object.keys(options).map((key, index) => (
              <div
                key={index}
                className={`py-2 px-4 text-left  cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-emerald-700 rounded-lg ${index === 0 ? 'mt-3' : ''}`}
                onClick={() => handleSelectOption(options[key])}
                name={name}
              >
                {key}
              </div>
            ))}
          </div>
        )}
      </div>

  );
};

export default memo(SelectComponent);