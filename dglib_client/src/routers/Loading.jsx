
const Loading = ({text}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-9999">
                    <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00893B] mb-3"></div>
                        <p className="text-gray-700">{ text ? text : "로딩중입니다.."}</p>
                    </div>
        </div>
    )
}

export default Loading;