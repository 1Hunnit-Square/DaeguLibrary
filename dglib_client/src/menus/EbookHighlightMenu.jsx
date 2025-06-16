import { forwardRef, useState, useEffect } from 'react';
import EbookMenuWrapper from './EbookMenuWrapper';
import { cfiRangeSpliter } from '../util/EbookUtils';


const EbookHighlightMenu = ({control, onToggle, onClickHighlight, emitEvent, viewerRef, highlights }, ref) => {
  const [highlightList, setHighlightList] = useState([]);


  useEffect(() => {
    const items = highlights.map( h => {
      const onClickHighlight_ = () => {
          if (!viewerRef.current) return;

          const splitCfi = cfiRangeSpliter(h.cfiRange)
          if (!splitCfi) return;

          const {startCfi} = splitCfi;
          console.log('onClickHighlight_ startCfi:', startCfi);
          viewerRef.current.setLocation(startCfi);
          emitEvent();
          const svgContainer = viewerRef.current.querySelector("svg");
          if (!svgContainer) return;

          const targetSvg = svgContainer.querySelector(`g[data-epubcfi="${h.cfiRange}"]`);
          if (!targetSvg) return;

          onClickHighlight(targetSvg.childNodes[0]);
        }
      return (
      <button
        key={h.id || h.highlightId}
        name="wrapper"
        onClick={onClickHighlight_}
        className="px-6 py-4 flex items-start justify-start bg-gray-50 transition-colors duration-100 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer outline-none text-left border-b border-gray-100  first:border-t first:border-gray-100"
      >
        <div className="flex flex-col w-full text-inherit">
          <div name="title" className="text-sm font-semibold text-gray-800 mb-4 hover:text-green-400 focus:text-green-400">
            {h.chapterName}
          </div>
          <div name="postOut" className="relative text-sm p-2 box-border">
            <div
              name="postIn"
              className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
              style={{
                backgroundColor: h.color,
                mixBlendMode: 'multiply'
              }}
            />
            <div className="relative z-10 text-gray-700">
              {h.content}
            </div>
          </div>
        </div>
      </button>
    );
  });
    setHighlightList(items);
  }, [highlights, viewerRef, emitEvent]);

  return (
    <>
            {control?.display && (
                <EbookMenuWrapper title="책갈피" show={control.open} onClose={onToggle} ref={ref}>
                    <div name="layout" className="flex-1 flex box-border py-6 flex-col">
                      {highlightList.length > 0
                      ? highlightList
                      : <div className="flex-1 h-auto flex items-center justify-center text-xs">책갈피가 없습니다.</div>
                    }

                    </div>

                </EbookMenuWrapper>
            )}
           </>
  );
}
export default forwardRef(EbookHighlightMenu);