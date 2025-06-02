import EbookMenuWrapper from './EbookMenuWrapper';
import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import { bookInfoState, bookTocState } from '../atoms/EbookState';

const EbookNavMenu = forwardRef(({control, onToggle, onLocation}, ref) => {
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
                {Tocs}
            </EbookMenuWrapper>
        )}
       </>
    )
});

EbookNavMenu.displayName = 'EbookNavMenu';

export default EbookNavMenu;