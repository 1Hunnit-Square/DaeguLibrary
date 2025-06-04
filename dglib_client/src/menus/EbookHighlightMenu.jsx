import { forwardRef, useState, useEffect } from 'react';
import EbookMenuWrapper from './EbookMenuWrapper';
import { useRecoilValue } from 'recoil';
import { bookLabelState } from '../atoms/EbookState';


const EbookHighlightMenu = ({control, onToggle, onClickHighlight, emitEvent, viewerRef }, ref) => {
    const [ highlights, setHighlights] = useRecoilValue(bookLabelState);
    const [highlightList, setHighlightList] = useState([]);




  return (
    <>
            {control?.display && (
                <EbookMenuWrapper title="책갈피" show={control.open} onClose={onToggle} ref={ref}>
                    "하이염"
                </EbookMenuWrapper>
            )}
           </>
  );
}
export default forwardRef(EbookHighlightMenu);