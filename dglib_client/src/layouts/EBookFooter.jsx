import { useRecoilValue } from 'recoil';
import { currentLocationState } from '../atoms/EbookState';
import { memo } from 'react';
import Button from '../components/common/Button';

const EbookFooter = ({onPageMove}) => {
    const currentLocation = useRecoilValue(currentLocationState);
    return (
        <div className="h-[60px] bg-white border-t border-gray-200 shadow-lg flex items-center justify-between px-4 sm:px-8">
            <div className="flex-1 flex justify-start">
                <Button
                    onClick={() => onPageMove("PREV")}
                    className="flex items-center gap-2"
                >
                    ‹ <span className="hidden sm:inline">이전</span>
                </Button>
            </div>

            <div className="flex-1 flex justify-center px-4">
                <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                    <span className="text-sm sm:text-base text-gray-800 font-medium truncate max-w-[120px] sm:max-w-[200px] block text-center">
                        {currentLocation.chapterName}
                    </span>
                </div>
            </div>

            {/* <div className="flex-1 flex justify-center items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">독서률: </span>
                <span className="text-xs sm:text-sm text-gray-700">{currentLocation.progress}%</span>
                <div className="w-12 sm:w-20 h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${currentLocation.progress}%` }}
                    />
                </div>
            </div> */}

            <div className="flex-1 flex justify-end">
                <Button
                    onClick={() => onPageMove("NEXT")}
                    className="flex items-center gap-2"
                >
                    <span className="hidden sm:inline">다음</span> ›
                </Button>
            </div>
        </div>
    )
}

export default memo(EbookFooter);