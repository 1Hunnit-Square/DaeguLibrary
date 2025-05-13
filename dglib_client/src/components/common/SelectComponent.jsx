import { useState, useEffect, useRef } from "react";
import { FiChevronDown } from 'react-icons/fi';
import { FiSearch } from 'react-icons/fi';

const SearchSelectComponent = ({
  options = [],
  dropdownClassName = "",
  selectClassName = "",
  defaultCategory = "",
  onChange
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultCategory);
  const dropdownRef = useRef(null);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option);
  };


useEffect(() => {
  setSelectedOption(defaultCategory);
}, [defaultCategory]);

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
          className={`flex z-20 relative items-center justify-between w-32 px-4 py-2 rounded-2xl bg-white  ${selectClassName}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption}</span>
          <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute z-10 -mt-4 ${dropdownClassName} bg-white border dropdownClassName border-[#00893B] rounded-lg shadow-lg`}>
            {options.map((option, index) => (
              <div
                key={index}
                className={`py-2 px-4 text-left  cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-emerald-700 ${index === 0 ? 'mt-3' : ''}`}
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

  );
};

export default SearchSelectComponent;