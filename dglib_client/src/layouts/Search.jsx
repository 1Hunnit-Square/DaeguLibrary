import React, { memo } from 'react';
import { FiSearch } from 'react-icons/fi';

const Search = () => {
    return (
        <div className="search relative w-full flex justify-center">
            <div className="relative w-[70%]">
                <input
                    type="text"
                    placeholder="도서검색.."
                    className="w-full p-2 pl-4 pr-12 rounded-full bg-white focus:outline-none"
                />
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700 p-1"
                    aria-label="검색"
                >
                    <FiSearch size={20} />
                </button>
            </div>
        </div>
    );
};

export default memo(Search);