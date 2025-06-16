import EbookMenuWrapper from './EbookMenuWrapper';
import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import { bookInfoState, bookTocState } from '../atoms/EbookState';
import { API_ENDPOINTS, API_SERVER_HOST } from '../api/config';

const EbookNavMenu = ({control, onToggle, onLocation}, ref) => {
    const bookInfo = useRecoilValue(bookInfoState);
    const bookToc = useRecoilValue(bookTocState);


    const onClickItem = (loc) => {
        onLocation(loc.href);
        onToggle();
    }

    const Tocs = bookToc.map((t, idx) => (
        <button
            key={idx}
            className="w-full h-12 box-border px-6 py-3 flex items-center cursor-pointer bg-gray-50 outline-none focus:outline-none hover:outline-none group last:mb-8"
            onClick={() => onClickItem(t)}
        >
            <span className="text-sm transition-all duration-200 ease-in-out group-focus:text-green-500 group-hover:text-green-500 group-focus:ml-3 group-hover:ml-3 truncate w-full text-left">
                {t.label}
            </span>
        </button>
    ));

    return (
       <>
        {control?.display && (
            <EbookMenuWrapper title="목차" show={control.open} onClose={onToggle} ref={ref}>
                <div name="container" className="flex p-6 gap-3">
                    <img src={`${API_SERVER_HOST}${API_ENDPOINTS.view}/${bookInfo.ebookCover}`} className="mr-3, w-[44%] min-w-[120px]  bg-[#eee]" />
                    <div name="bookContent" className="flex-1">
                        <div name="title" className="mb-1 font-medium">{bookInfo.ebookTitle}</div>
                        <div name="author" className="text-sm mb-1">{bookInfo.ebookAuthor}</div>
                        <div name="publisher" className="text-sm mb-1">{bookInfo.ebookPublisher}</div>
                    </div>
                </div>
                {Tocs}
            </EbookMenuWrapper>
        )}
       </>
    )
};

EbookNavMenu.displayName = 'EbookNavMenu';

export default forwardRef(EbookNavMenu);