import { memo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books/search?query=${encodeURIComponent(searchQuery)}&option=전체&isSearched=true&tab=info&page=1`);
        }
    };
    return (
        <div className="search relative w-full flex justify-center">
            <div className="relative w-[70%] bg-black/20 backdrop-blur-md rounded-full p-6 shadow-2xl">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="도서검색.."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 sm:p-3 pl-4 sm:pl-5 pr-10 sm:pr-13 rounded-full shadow-lg bg-white border-2 border-gray-200 focus:outline-none text-sm sm:text-base"
                    />
                    <button
                        type="submit"
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                        aria-label="검색"
                    >
                        <FiSearch size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
export default memo(Search);