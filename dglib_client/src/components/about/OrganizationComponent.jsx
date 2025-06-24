const OrganizationComponent = () => {
    return (
        <div className="organization-component max-w-5xl mx-auto p-6 md:p-10 bg-white text-gray-800">
            {/* 조직도 */}
            <h3 className="text-xl font-bold mb-10">조직도</h3>
            <div className="relative flex flex-col items-center space-y-6">
                {/* 중앙 상단 박스 */}
                <div className="bg-green-700 text-white font-bold px-8 py-4 rounded-md shadow z-10 mb-5">
                    대구도서관
                </div>
                {/* 선: 상단 박스에서 아래로 수직선 */}
                <div className="h-15 w-0.5 bg-gray-400"></div>
                {/* 가로 선 + 하단 박스 3개 */}
                <div className="relative w-full flex justify-center items-start">
                    {/* 수평선 */}
                    <div className="absolute top-7 left-1/4 w-1/2 h-px bg-gray-400 z-0"></div>
                    {/* 각 팀 박스 */}
                    <div className="flex space-x-30 z-10">
                        <div className="bg-orange-400 text-white font-bold px-8 py-4 rounded-md shadow text-center">
                            지식문화팀
                        </div>
                        <div className="bg-purple-500 text-white font-bold px-8 py-4 rounded-md shadow text-center">
                            문화사업팀
                        </div>
                        <div className="bg-blue-500 text-white font-bold px-8 py-4 rounded-md shadow text-center">
                            정보지원팀
                        </div>
                    </div>
                </div>
            </div>


            {/* 연락처 */}
            <div className="mt-15 border border-gray-200 rounded-lg p-5 bg-gray-50 text-sm text-center flex flex-col sm:flex-row sm:justify-center sm:gap-10 shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-2 sm:mb-0">
                    <span>📞</span>
                    <span className="font-semibold">대표번호:</span>
                    <span>053-269-3513</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <span>📠</span>
                    <span className="font-semibold">팩스:</span>
                    <span>053-269-3530</span>
                </div>
            </div>

            {/* 현황 테이블 */}
            <div className="mt-15">
                <h3 className="text-xl font-bold mb-4">조직 현황</h3>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto text-sm border-collapse border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border border-gray-300 px-4 py-3">부서명</th>
                                <th className="border border-gray-300 px-4 py-3">성명</th>
                                <th className="border border-gray-300 px-4 py-3">직위</th>
                                <th className="border border-gray-300 px-4 py-3">담당업무</th>
                                <th className="border border-gray-300 px-4 py-3">전화번호</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-3 text-center">대구도서관</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">백승민</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">도서관장</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">도서관 업무 총괄</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">053-269-0708</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-3 text-center">지식문화팀</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">김대형</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">지식문화팀장</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">지식문화팀 업무 총괄</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">053-269-0709</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-3 text-center">문화사업팀</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">임효진</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">문화사업팀장</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">문화사업팀 업무 총괄</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">053-269-0710</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-3 text-center">정보지원팀</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">박지민</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">정보지원팀장</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">정보지원팀 업무 총괄</td>
                                <td className="border border-gray-300 px-4 py-3 text-center">053-269-0711</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default OrganizationComponent;
