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
import EbookContextMenu from '../../menus/EbookContextMenu';
import useHighlight from '../../hooks/useHighlight'
import { API_SERVER_HOST } from '../../api/config';
import usePageSaver from '../../hooks/usePageSaver';
import { API_ENDPOINTS } from '../../api/config'
import { set } from 'lodash'


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
    const [isContextMenu, setIsContextMenu] = useState(false);
    // const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [showRestoreLoading, setShowRestoreLoading] = useState(false);
    // const [ isisloadoing , setIsLoading ] = useState(false);
    const { savedPage, restorePosition } = usePageSaver(ebookId, currentLocation, viewerRef);
    const [hasRestoredOnce, setHasRestoredOnce] = useState(false);
    const [isOptimized, setIsOptimized] = useState(false);
    const optimizedRef = useRef(false);
    const hasRunOptimization = useRef(false);
    const [isReadyForOptimization, setIsReadyForOptimization] = useState(false);
    const [isViewerReady, setIsViewerReady] = useState(false);
    // useEffect(() => {
    //     setTimeout(() => {
    //         setIsLoading(false);
    //     }, 1000);
    // }, [])





    const [ bookStyle, setBookStyle ] = useState({
        fontFamily: '맑은 고딕',
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

   
    const { selection, highlights, onSelection, onClickHighlight, onAddHighlight, onRemoveHighlight, onUpdateHighlight} = useHighlight(viewerRef, setIsContextMenu, bookStyle, bookOption.flow, ebookId);

    const { data = {}, isLoading, isError } = useQuery({
        queryKey: ['ebookInfo', ebookId],
        queryFn: () => getEbookInfo(ebookId),
        refetchOnWindowFocus: false,
    });
    console.log(data);

    useEffect(() => {
        if (data && data.ebookId) {
            setBookInfo(data);
        }
    }, [data, setBookInfo]);

    // useEffect(() => {
    //     const viewer = viewerRef.current;
    //     if (viewer && viewer.state.rendition) {
    //         const rendition = viewer.state.rendition;
    //         const handleDisplay = () => {
    //             if (!viewerReady) {
    //                 console.log("뷰어가 준비되었습니다.");
    //                 setIsViewerReady(true);
    //             }
    //         }
    //         rendition.on('display', handleDisplay);
    //         return () => {
    //             rendition.off('display', handleDisplay);
    //         };
    //     }
    // }, [viewerRef.current, isViewerReady])
    useEffect(() => {
        console.log("렌더링 시작");
        if (currentLocation && currentLocation.startCfi && !hasRunOptimization.current) {
            console.log("Epub 뷰어 렌더링 완료")
            hasRunOptimization.current = true;
            const runOptimizationAndRestore = async () => {
                try {
                    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
                    console.log("최적화 1단계: scrolled-doc으로 변경");
                    setIsOptimized(true);
                    setBookOption(prev => ({ ...prev, flow: "scrolled-doc" }));
                    await wait(2000);
        
                    console.log("최적화 2단계: paginated로 변경");
                    setBookOption(prev => ({ ...prev, flow: "paginated" }));
                    await wait(2000);
        
                    console.log("최적화 최종 완료");
                    setIsOptimized(false);
                    optimizedRef.current = true;
        
                    if (savedPage) {
                        console.log("페이지 복원 시작");
                        setShowRestoreLoading(true);
                        await wait(500);
                        restorePosition();
                        await wait(500);
                        setShowRestoreLoading(false);
                    }
                } catch (error) {
                    console.error("최적화 또는 복원 중 에러 발생:", error);
                    setIsOptimized(false);
                    setShowRestoreLoading(false);
                }
            };
    
            
            runOptimizationAndRestore();
        }
    }, [currentLocation, savedPage, restorePosition]); 



//     useEffect(() => {
//     if (data && !isLoading && viewerRef.current && savedPage && isFirstLoad) {
//         setShowRestoreLoading(true);
//         const timer = setTimeout(() => {
//             restorePosition();
//         }, 2000);

//         return () => {
//             clearTimeout(timer);
//         }
//     }
// }, [data, isLoading, savedPage, restorePosition, isFirstLoad]);


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
      

        const progress = location.currentPage && location.totalPage
            ? Math.round((location.currentPage / location.totalPage) * 100)
            : 0;
        setCurrentLocation({
            chapterName: location.chapterName || '',
            progress: progress,
            startCfi: location.startCfi || '',
            endCfi: location.endCfi || '',
            base: location.base || '',
            currentPage: location.currentPage || 0,
        });
        if (showRestoreLoading && savedPage && location.startCfi === savedPage) {
        console.log('저장된 페이지 이동 완료!');
        setShowRestoreLoading(false);
    }
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


    const onContextMenu = (cfiRange) => {
        const result = onSelection(cfiRange);
        setIsContextMenu(result);
    }

    const onContextmMenuRemove = useCallback(() => {
        setIsContextMenu(false);
    }, []);


    return (
        <>
        {(isLoading || showRestoreLoading || isOptimized || !hasRunOptimization.current) && (
            <Loading
                text={
                    isLoading
                        ? "전자책을 불러오는 중입니다..."
                        : showRestoreLoading
                        ? "저장된 위치로 이동 중입니다..."
                        : "전자책을 최적화하는 중입니다..."
                }
            />
        )}
        {!isLoading && data && data.ebookFilePath &&  (
        <div className="relative w-screen h-screen overflow-x-hidden flex flex-col scrollbar-hidden">
            <EBookHeader onNavToggle={onNavToggle} onOptionToggle={onOptionToggle} onLearningToggle={onLearningToggle} />
            <div className="flex-1">
                <ReactEpubViewer
                    url={`${API_SERVER_HOST}${API_ENDPOINTS.view}/${data.ebookFilePath}`}
                    ref={viewerRef}
                    viewerLayout={viewerLayout}
                    viewerStyle={bookStyle}
                    viewerOption={bookOption}
                    onPageChange={updateCurrentPage}
                    onTocChange={onTocChange}
                    onSelection={onContextMenu}
                    loadingView={<Loading text="전자책을 불러오는 중입니다..." />}
                />
            </div>

            <EbookFooter
                onPageMove={onPageMove}
               />
            <EbookNavMenu control={navControl} onToggle={onNavToggle} onLocation={onLocationChange} ref={navRef}/>

            <EbookOptionMenu control={optionControl} bookStyle={bookStyle} bookOption={bookOption} bookFlow={bookOption.flow}
                onToggle={onOptionToggle} onBookStyleChange={setBookStyle} onBookOptionChange={setBookOption} ref={optionRef} emitEvent={emitEvent} />

            <EbookHighlightMenu  emitEvent={emitEvent} viewerRef={viewerRef} control={learningControl} onToggle={onLearningToggle}
            ref={learningRef} highlights={highlights} onClickHighlight={onClickHighlight}/>

            <EbookContextMenu active={isContextMenu} viewerRef={viewerRef} selection={selection} highlights={highlights}
            onAddHighlight={onAddHighlight} onRemoveHighlight={onRemoveHighlight} onUpdateHighlight={onUpdateHighlight}
            onContextmMenuRemove={onContextmMenuRemove}/>
        </div>
    )}
        </>
    );
}

export default EbookViewerComponent;