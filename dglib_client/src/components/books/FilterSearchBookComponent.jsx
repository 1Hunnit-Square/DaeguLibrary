import Button from "../common/Button";

const FilterSearchBookComponent = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">도서명</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">ISBN</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">저자</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">발행연도</p>
                    <input type="text" className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <span className="mx-2">-</span>
                    <input type="text" className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">출판사</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center">
                    <p className="w-24 font-medium text-gray-700">정렬기준</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center col-span-2">
                    <p className="w-24 font-medium text-gray-700">키워드</p>
                    <input type="text" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="col-span-2 flex justify-center mt-4">
                    <Button children="검색"/>
                </div>
            </div>
        </div>
    );
}

export default FilterSearchBookComponent;