import { useRecoilValue } from 'recoil';
import { currentLocationState } from '../atoms/EbookState';

const EbookFooter = ({onPageMove}) => {
    const currentLocation = useRecoilValue(currentLocationState);
    return (
        <div className="h-[60px] border flex items-center justify-between px-1 sm:px-6 bg-gray-50">

                <div className="flex-1 flex justify-start">
                    <button
                        onClick={() => onPageMove("PREV")}
                        className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                        ‹
                        <span className="hidden sm:inline">이전</span>
                    </button>
                </div>

                <div className="flex-1 flex justify-center">
                    <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">{currentLocation.chapterName}</span>
                </div>

                <div className="flex-1 flex justify-center items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">독서률: </span>
                    <span className="text-xs sm:text-sm text-gray-700">{currentLocation.progress}%</span>
                    <div className="w-12 sm:w-20 h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${currentLocation.progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => onPageMove("NEXT")}
                        className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                        <span className="hidden sm:inline">다음</span>
                        ›
                    </button>
                </div>
            </div>
    )
}

export default EbookFooter;