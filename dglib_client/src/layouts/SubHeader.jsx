import { Link } from "react-router-dom";
import { useState, useEffect, memo, useCallback } from "react";

const SubHeader = memo(( {subTitle, mainTitle} ) => {
    const [showToast, setShowToast] = useState(false);

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
            <div className="text-left text-5xl px-4 py-4">{subTitle}</div>
            <div className="flex items-center mr-4">
                <Link to = "/"> <img src="/home.png" className="w-8 h-8" /> </Link>
                <div className="mx-2">{mainTitle}</div>
                <div className="mx-2">&gt;</div>
                <div className="text-[#00893B]">{subTitle}</div>
                <div className="mx-2" onClick={handleShare}>
                    <img src="/share.png" className="w-8 h-8 cursor-pointer" />
                </div>
                <div> <img onClick={handlePrint} src="/print.png" className="w-8 h-8" /> </div>
            </div>
        </div>
        <div className="w-[98%] h-[1px] bg-[#00893B] mt-4 mx-auto"></div>

        {showToast && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
                현재 주소가 클립보드에 복사되었습니다.
            </div>
        )}
        </div>
    );
});

export default SubHeader;