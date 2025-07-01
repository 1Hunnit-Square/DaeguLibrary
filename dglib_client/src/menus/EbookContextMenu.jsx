import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { bookLabelState } from '../atoms/EbookState';
import { getParagraphCfi } from '../util/EbookUtils';


const EbookContextMenu = ({active, viewerRef, selection, onAddHighlight, highlights, onRemoveHighlight, onUpdateHighlight, onContextmMenuRemove }) => {

    const colorList = [
          { name: "Red", code: "#ff1517" },
          { name: "Orange", code: "#ff6c40"},
          { name: "Yellow", code: "#fee500"},
          { name: "Green", code: "#07b100"},
          { name: "Blue", code: "#3972ff"},
          { name: "Purple", code: "#7d39ff"}
        ];
    const menuRef = useRef(null);

    const [highlight, setHighlight] = useState(null);
    const [display, setDisplay] = useState(false);
    const [isEraseBtn, setIsEraseBtn] = useState(false);
    const [isReverse, setIsReverse] = useState(false);
    const [height, setHeight] = useState(0);
    const [y, setY] = useState(selection.y);



    const ColorList = colorList.map((color) => {
    const getCurrentHighlight = () => {
        const paragraphCfi = getParagraphCfi(selection.cfiRange);
        if (!paragraphCfi) return null;
        const filtered = highlights.filter(h => h.cfiRange === selection.cfiRange);
        return filtered.length ? filtered[0] : null;
    };

    return (
        <div
            name="wrapper"
            key={color.code}
            onClick={selection.update ? () => onUpdateHighlight(getCurrentHighlight(), color.code) : () => onAddHighlight(color.code)}
            className="flex items-center justify-center w-full h-[32px] rounded-md cursor-pointer bg-black/0 outline-none transition-all duration-100 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-[#618eff] focus:bg-[#618eff]"
        >
            <div name="colorWrapper" className="w-4 h-4 rounded-[16px] bg-white mr-4">
                <div name="color" className="w-4 h-4 rounded-[16px] opacity-40" style={{ backgroundColor: color.code }}></div>
            </div>
            <span name="message" className="w-12 text-sm text-[#ddd] leading-5">{color.name}</span>
        </div>
    );
});

    const onRemoveHighlight_ = useCallback(() => {
        const paragraphCfi = getParagraphCfi(selection.cfiRange);
        if (!paragraphCfi) return;

        const filtered = highlights.filter(h => h.cfiRange === selection.cfiRange);
        if (!filtered.length) return;

        const currentHighlight = filtered[0];
        console.log("onRemoveHighlight_ called", currentHighlight);

        onRemoveHighlight(currentHighlight.highlightId, currentHighlight.cfiRange);
        onContextmMenuRemove();
        setIsEraseBtn(false);
    }, [highlights, selection.cfiRange, onRemoveHighlight, onContextmMenuRemove]);

    const onRemove = useCallback(( e ) => {
        if (!menuRef.current) return;
        if (menuRef.current.contains(e.target)) return;
        onContextmMenuRemove();
    }, [menuRef, onContextmMenuRemove]);

    const onKeyPress = useCallback(( { key }) => {
        key && key === "ArrowLeft" && onContextmMenuRemove();
        key && key === "ArrowRight" && onContextmMenuRemove();
    }, [onContextmMenuRemove]);

    useEffect(() => {
        console.log("selection.update:", selection.update);
        if(!active) setIsEraseBtn(false);

        const paragraphCfi = getParagraphCfi(selection.cfiRange);
        if (!paragraphCfi) return;

        const filtered = highlights.filter(h => h.cfiRange === selection.cfiRange);

        // if(!filtered.length) return;


        if (selection.update && filtered.length > 0) {
            setIsEraseBtn(true);
        } else {
            setIsEraseBtn(false);
        }
    }, [active, highlights, selection.cfiRange, selection.update]);

    useEffect(() => {
        if (!viewerRef.current) return;
        const iframe = document.querySelector('iframe');
        const node = iframe && iframe.contentWindow && iframe.contentWindow.document;
        const scrolledTarget = viewerRef.current.querySelector('div');

        if (active) {
            setDisplay(true);
            scrolledTarget && scrolledTarget.addEventListener('scroll', onContextmMenuRemove);
            node && node.addEventListener('mousedown', onRemove);
            node && node.addEventListener('keyup', onKeyPress);
            document.addEventListener('mousedown', onRemove);
            document.addEventListener('keyup', onKeyPress);
        } else {
            setDisplay(false);
            scrolledTarget && scrolledTarget.removeEventListener('scroll', onContextmMenuRemove);
            node && node.removeEventListener('mousedown', onRemove);
            node && node.removeEventListener('keyup', onKeyPress);
            document.removeEventListener('mousedown', onRemove);
            document.removeEventListener('keyup', onKeyPress);
        };
        return () => {
            node && node.removeEventListener('mousedown', onRemove);
            node && node.removeEventListener('keyup', onKeyPress);
            document.removeEventListener('mousedown', onRemove);
            document.removeEventListener('keyup', onKeyPress);
        }

    }, [active, viewerRef, onRemove, onContextmMenuRemove, onKeyPress]);

    useEffect(() => {
        const menuPadding = 8;
        const itemHeight = 32;
        let itemCnt = ColorList.length;
        if (isEraseBtn) itemCnt += 1;
        const defaultHeight = itemCnt * itemHeight + menuPadding;
        let y_ = selection.y;
        const { innerHeight } = window;
        if (selection.y + defaultHeight > innerHeight) {
            y_ = selection.y - selection.height - defaultHeight;
            if (y_ < 0) {
                setHeight (defaultHeight + y_ - 8);
                y_ = 8;
            } else {
                setHeight(defaultHeight);
            }
            setIsReverse(true);
        } else {
            setHeight(defaultHeight);
            setIsReverse(false);
        }

        setY(y_);
    }, [selection.y, selection.height, ColorList, isEraseBtn]);

    const contextmenuWidth  = 160;


  return (
            <>
            {display &&
        <div name="contextWrapper"
            ref={menuRef}
            className={`absolute box-border rounded bg-black/80 shadow-lg z-10 ${contextmenuWidth > 0 ? 'p-1' : ''}`}
            style={{
                left: window.innerWidth < selection.x + contextmenuWidth
                ? `${window.innerWidth - contextmenuWidth}px`
                : `${selection.x}px`,
                top: window.innerHeight < y + 40
                ? `${window.innerHeight - 40}px`
                : `${y}px`,
                width: contextmenuWidth + 'px',
                height: height + 'px',
            }} >
            <div
                className="absolute left-[80px] transform -translate-x-2 border-[8px] border-transparent z-[1]"
                style={{
                    [isReverse ? 'bottom' : 'top']: '-16px',
                    [isReverse ? 'borderTopColor' : 'borderBottomColor']: 'rgba(0,0,0,0.8)'
                }}
            />
            <div className="h-full overflow-y-auto scrollbar-hide">
                {ColorList}
                {isEraseBtn &&
                <button onClick={onRemoveHighlight_} className="w-full h-[32px] leading-[32px] text-center text-[14px] text-[#ccc]
                                                    transition-[background-color,color] duration-100 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                                                    bg-transparent rounded-md cursor-pointer outline-none
                                                    hover:text-white hover:bg-[#ff4445] focus:text-white focus:bg-[#ff4445]">
                                                        Remove</button>}
            </div>
        </div>}

           </>
  );
}
export default EbookContextMenu;