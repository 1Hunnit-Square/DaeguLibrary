import { Link } from "react-router-dom";
import { useState, useRef, memo, useCallback, useEffect } from "react";



const SubHeader = ( {subTitle, mainTitle, print} ) => {
    const [showToast, setShowToast] = useState(false);

    useEffect(()=>{
    document.title = `${mainTitle} > ${subTitle}`;

        return (()=> {document.title = "대구도서관";})
    },[subTitle, mainTitle])

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
            });
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex w-full justify-between items-end">
                <div className="text-left text-xl sm:text-2xl md:text-3xl px-4 py-3 font-semibold">{subTitle}</div>
                <div className="flex items-center mr-4">
                    <Link to="/"> <img src="/home.png" className="w-10 h-10" /> </Link>
                    <div className="mx-2 text-xs sm:text-sm hidden sm:block">{mainTitle}</div>
                    <div className="mx-2 text-xs sm:text-sm hidden sm:block">&gt;</div>
                    <div className="text-[#00893B] text-xs sm:text-sm hidden sm:block">{subTitle}</div>
                    <div className="mx-2" onClick={handleShare}>
                        <img src="/share.png" className="w-10 h-10 cursor-pointer" />
                    </div>
                    <div> <img onClick={print} src="/print.png" className="w-10 h-10 cursor-pointer" /> </div>
                </div>
            </div>
            <div className="w-full h-px bg-gray-200 mt-4"></div>

            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                    현재 주소가 클립보드에 복사되었습니다.
                </div>
            )}
        </div>
    );
};

export default memo(SubHeader);