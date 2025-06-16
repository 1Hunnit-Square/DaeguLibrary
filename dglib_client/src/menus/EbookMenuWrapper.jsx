import { forwardRef, useEffect, useCallback } from 'react';

const EbookMenuWrapper = ({ title, show, onClose, children }, ref) => {
    const handleOutsideClick = useCallback((e) => {
        if (ref?.current && !ref.current.contains(e.target)) {
            onClose();
        }
    }, [ref, onClose]);

    const handleIframeClick = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (show) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);

            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.addEventListener('mousedown', handleIframeClick);
                    iframe.contentWindow.addEventListener('touchstart', handleIframeClick);
            }
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);

            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.removeEventListener('mousedown', handleIframeClick);
                    iframe.contentWindow.removeEventListener('touchstart', handleIframeClick);
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [show, handleOutsideClick, handleIframeClick]);

    return (
        <div
            ref={ref}
            className={`
                fixed flex flex-col w-[340px] max-w-[95vw] h-screen top-0 right-0 z-10
                bg-white rounded-l-2xl shadow-[-4px_0_8px_0_rgba(0,0,0,0.16)]
                transition-all duration-400 ease-in-out overflow-y-auto scrollbar-hidden
                ${show
                    ? 'translate-x-0 scale-100'
                    : 'translate-x-[420px] scale-90'
                }
            `}

        >



            <div className="w-full min-h-16 flex items-center justify-between pt-1">
                <span className="pl-6 text-xl font-semibold">
                    {title}
                </span>
                <button
                    onClick={onClose}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-2xl font-light"
                >
                    &times;
                </button>
            </div>
            {children}
        </div>
    );
};

EbookMenuWrapper.displayName = 'EbookMenuWrapper';

export default forwardRef(EbookMenuWrapper);