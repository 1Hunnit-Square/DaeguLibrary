import { useState, useEffect, memo, useRef } from "react";
import { FiChevronDown } from 'react-icons/fi';
import { FiSearch } from 'react-icons/fi';

const SearchSelectComponent = ({
  options = [],
  handleSearch,
  wrapClassName = "",
  input = "",
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  buttonClassName = "",
  selectClassName = "",
  placeholder = "검색어를 입력하세요...",
  defaultCategory = "전체"
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState(input);
  const dropdownRef = useRef(null);


  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery, selectedOption);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

useEffect(() => {
  setSearchQuery(input);
}, [input]);


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
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <div className="relative mr-2" ref={dropdownRef}>
        <button
          type="button"
          className={`flex z-20 relative items-center justify-between w-32 px-4 py-2 border border-[#00893B] rounded-2xl bg-white  ${selectClassName}`}
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
                className={`py-2 px-4 text-left  cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-emerald-700 ${index === 0 ? 'mt-3' : ''} rounded-lg`}
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`relative flex-1 ${wrapClassName}`}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className={`p-2 pl-4 pr-12 rounded-2xl border border-[#00893B] focus:outline-none ${inputClassName}`}
        />
        <button
          type="submit"
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700 p-1 ${buttonClassName}`}
        >
          <FiSearch size={20} />
        </button>
      </div>
    </form>
  );
};

export default memo(SearchSelectComponent);