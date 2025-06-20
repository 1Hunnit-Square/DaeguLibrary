import { memo } from 'react';

const EBookHeader = ({onNavToggle, onOptionToggle, onLearningToggle}) => {
    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
            <button 
                className="text-gray-700 hover:text-emerald-600 font-medium mr-8 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-200"
                onClick={onNavToggle}
            >
                목차
            </button>
            <button 
                className="text-gray-700 hover:text-emerald-600 font-medium mr-8 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-200"
                onClick={onOptionToggle}
            >
                설정
            </button>
            <button 
                className="text-gray-700 hover:text-emerald-600 font-medium mr-6 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-200"
                onClick={onLearningToggle}
            >
                책갈피
            </button>
        </div>
    );
}

export default memo(EBookHeader);