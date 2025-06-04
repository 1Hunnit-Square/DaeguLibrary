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
import EbookHighlightMenu from '../../menus/EbookHighlightMenu'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { getEbookInfo } from '../../api/memberApi';
import Loading from '../../routers/Loading'


const EbookViewerComponent = () => {
    const [searchParams] = useSearchParams();
    const ebookId = searchParams.get('id');
    const viewerRef = useRef(null);
    const navRef = useRef(null);
    const optionRef = useRef(null);
    const learningRef = useRef(null);
    const [navControl, onNavToggle] = useEbookMenu(navRef, 300);
    const [optionControl, onOptionToggle, emitEvent] = useEbookMenu(optionRef, 300);
    const [learningControl, onLearningToggle] = useEbookMenu(learningRef, 300);
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

    const { data = {}, isLoading, isError } = useQuery({
        queryKey: ['ebookInfo', ebookId],
        queryFn: () => getEbookInfo(ebookId),
    });
    console.log(data);

    useEffect(() => {
        if (data && !isLoading) {
                setBookInfo({
                    ebookTitle : data.ebookTitle || '',
                    ebookAuthor : data.ebookAuthor || '',
                    ebookCover : data.ebookCover || '',
                    ebookPublisher : data.ebookPublisher || '',
                })

        }
    }, [data])






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
            base: location.base || '',
            pageNum: location.currentPage || 0,
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

    useEffect(() => {
        if (viewerRef.current) {
            console.log('ReactEpubViewer instance:', viewerRef.current);
        }
    }, []);



    return (
        <>
        {isLoading && <Loading />}
        {!isLoading && data && data.ebookFilePath && (
        <div className="relative w-screen h-screen overflow-x-hidden flex flex-col scrollbar-hidden">
            <EBookHeader onNavToggle={onNavToggle} onOptionToggle={onOptionToggle} onLearningToggle={onLearningToggle} />
            <div className="flex-1">
                <ReactEpubViewer
                    url={`http://localhost:8090/api/view/${data.ebookFilePath}`}
                    ref={viewerRef}
                    viewerLayout={viewerLayout}
                    viewerStyle={bookStyle}
                    viewerOption={bookOption}
                    onPageChange={updateCurrentPage}
                    onTocChange={onTocChange}
                    loadingView={<Loading text="전자책을 불러오는 중입니다..." />}
                />
            </div>

            <EbookFooter
                onPageMove={onPageMove}
               />
            <EbookNavMenu control={navControl} onToggle={onNavToggle} onLocation={onLocationChange} ref={navRef}/>
            <EbookOptionMenu control={optionControl} bookStyle={bookStyle} bookOption={bookOption} bookFlow={bookOption.flow}
                onToggle={onOptionToggle} onBookStyleChange={setBookStyle} onBookOptionChange={setBookOption} ref={optionRef} emitEvent={emitEvent} />
            <EbookHighlightMenu control={learningControl} onToggle={onLearningToggle} ref={learningRef} />
        </div>
    )}
        </>
    );
}

export default EbookViewerComponent;