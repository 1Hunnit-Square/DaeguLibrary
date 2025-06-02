import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { EpubViewer, ReactEpubViewer } from 'react-epub-viewer'
import "regenerator-runtime"
import EbookFooter from '../../layouts/EBookFooter'
import { useEbookMenu } from '../../hooks/useEbookMenu'
import EbookNavMenu from '../../menus/EbookNavMenu'
import EBookHeader from '../../layouts/EBookHeader'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { bookInfoState, bookTocState, currentLocationState } from '../../atoms/EbookState';
import EbookOptionMenu from '../../menus/EbookOptionMenu';

const EbookViewerComponent = () => {
    const viewerRef = useRef(null);
    const navRef = useRef(null);
    const optionRef = useRef(null);
    const [navControl, onNavToggle] = useEbookMenu(navRef, 300);
    const [optionControl, onOptionToggle, emitEvent] = useEbookMenu(optionRef, 300);
    const [bookInfo, setBookInfo] = useRecoilState(bookInfoState);
    const setBookToc = useSetRecoilState(bookTocState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [ bookStyle, setBookStyle ] = useState({
        fontFamily: 'Origin',
        fontSize: 18,
        lineHeight: 1.4,
        marginHorizontal: 15,
        marginVertical: 5,
    })
    const [ bookOption, setBookOption ] = useState({
        flow: 'paginated',
        resizeOnOrientationChange: true,
        spread: "auto"
    });


    useEffect(() => {
            const handleKeyDown = (event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
                    event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };

            document.addEventListener('keydown', handleKeyDown, true);

            return () => {
                document.removeEventListener('keydown', handleKeyDown, true);
            };
        }, []);







    const viewerLayout = useMemo(() => ({
        MIN_VIEWER_WIDTH: 300,
        MIN_VIEWER_HEIGHT: 300,
        VIEWER_HEADER_HEIGHT: 64,
        VIEWER_FOOTER_HEIGHT: 60,
        VIEWER_SIDEMENU_WIDTH: 0
    }), []);

    const updateCurrentPage = useCallback((location) => {
      console.log('Current location:', location);


        const progress = location.currentPage && location.totalPage
            ? Math.round((location.currentPage / location.totalPage) * 100)
            : 0;
        setCurrentLocation({
            chapterName: location.chapterName || '',
            progress: progress,
            startCfi: location.startCfi || '',
            endCfi: location.endCfi || '',
            base: location.base || ''
        });
    }, [setCurrentLocation]);

    const onPageMove = useCallback((type) => {
      const node = viewerRef.current;
      if (!node || !node.prevPage || !node.nextPage) return;
      type === "PREV" ? node.prevPage() : node.nextPage();
    }, []);

   const onLocationChange = useCallback((loc) => {
        if(!viewerRef.current) return;
        viewerRef.current.setLocation(loc);
    }, []);

    const onTocChange = useCallback((toc) => {
        setBookToc(toc);
    }, []);



    return (
        <>

        <div className="relative w-screen h-screen overflow-x-hidden flex flex-col scrollbar-hidden">
            <EBookHeader onNavToggle={onNavToggle} onOptionToggle={onOptionToggle} />

            <ReactEpubViewer
                url={`http://localhost:8090/api/view/ebook/6/617a8e8c-0dc4-4005-b5d7-5307706d31e2.epub`}
                ref={viewerRef}
                viewerLayout={viewerLayout}
                viewerStyle={bookStyle}
                viewerOption={bookOption}
                onPageChange={updateCurrentPage}
                onTocChange={onTocChange}
            />

            <EbookFooter
                onPageMove={onPageMove}
               />
            <EbookNavMenu control={navControl} onToggle={onNavToggle} onLocation={onLocationChange} ref={navRef}/>
            <EbookOptionMenu control={optionControl} bookStyle={bookStyle} bookOption={bookOption} bookFlow={bookOption.flow}
                onToggle={onOptionToggle} onBookStyleChange={setBookStyle} onBookOptionChange={setBookOption} ref={optionRef} emitEvent={emitEvent} />
        </div>
        </>
    );
}

export default EbookViewerComponent;