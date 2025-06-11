import { useSearchInput } from "../../hooks/useSearchInput";
import { FiSearch } from 'react-icons/fi';
import { memo } from "react";

const SearchComponent = ({
  onSearch,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "검색어를 입력하세요..."
}) => {
  const { searchQuery, handleChange } = useSearchInput();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className={`p-2 pl-4 pr-12 rounded-2xl border border-[#00893B] focus:outline-none ${inputClassName}`}
      />
      <button
        type="submit"
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700 p-1 ${buttonClassName}`}
      >
        <FiSearch size={20} />
      </button>
    </form>
  );
};

export default memo(SearchComponent);