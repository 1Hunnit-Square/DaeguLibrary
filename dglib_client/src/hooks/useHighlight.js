import { useState, useEffect, useCallback, useRef } from 'react';
import { getParagraphCfi, clashCfiRange, getSelectionPosition, compareCfi, cfiRangeSpliter, getNodefromCfi } from '../util/EbookUtils';
import { useRecoilState } from 'recoil';
import { currentLocationState, bookLabelState } from '../atoms/EbookState';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHighlights, addHighlight, updateHighlight, deleteHighlight } from '../api/memberApi';

const viewerLayout = () => ({
        MIN_VIEWER_WIDTH: 300,
        MIN_VIEWER_HEIGHT: 300,
        VIEWER_HEADER_HEIGHT: 64,
        VIEWER_FOOTER_HEIGHT: 60,
        VIEWER_SIDEMENU_WIDTH: 0
    });
const contextmenuWidth = 160;

const useHighlight = (viewerRef, setIsContextMenu, bookStyle, bookFlow, ebookId ) => {
    const [currentLocation] = useRecoilState(currentLocationState);
    const queryClient = useQueryClient();
    const justAddRef = useRef(null);

    // const [bookLabel, setBookLabel] = useRecoilState(bookLabelState);
    // const highlights = bookLabel.highlights;
    const [selection, setSelection] = useState({
        update: false,
        x: 0,
        y: 0,
        height: 0,
        cfiRange: '',
        content: ''
    })
    const { data: highlights = [], isLoading } = useQuery({
        queryKey: ['highlights', ebookId],
        queryFn: () => getHighlights(ebookId),
        enabled: !!ebookId,
    });

    const addHighlightMutation = useMutation({
        mutationFn: addHighlight,
        onSuccess: (addedHighlightData, variables) => {
            const newHighlightCfi = variables.cfiRange;
            console.log("새로 추가된 책갈피 데이터:", newHighlightCfi);
            if ( newHighlightCfi) {
                justAddRef.current = newHighlightCfi;
            }
            queryClient.invalidateQueries(['highlights', ebookId]);
            toast.success("책갈피가 추가되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
             setSelection({ ...selection, update: true });
             setTimeout(() => {
                const iframe = viewerRef.current?.querySelector('iframe');
                        const iframeWin = iframe?.contentWindow;
                        if (iframeWin && iframeWin.getSelection) {
                            iframeWin.getSelection().removeAllRanges();
                        }
             }, 500)


        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "책갈피 추가에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
        }
    });

    const updateHighlightMutation = useMutation({
        mutationFn: (data) => updateHighlight(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['highlights', ebookId]);
            toast.success("책갈피가 수정되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });

        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "책갈피 수정에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
        }
    });

    const deleteHighlightMutation = useMutation({
        mutationFn: deleteHighlight,
        onSuccess: (deletedData, variables) => {
            const { highlightId, cfiRange } = variables;
            viewerRef.current.offHighlight(cfiRange);

            toast.success("책갈피가 삭제되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
            queryClient.setQueryData(['highlights', ebookId], (oldData) => {
            if (!oldData) return [];
            return oldData.filter(h => h.highlightId !== highlightId);
        });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "책갈피 삭제에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
        }
    });

    const onSelection = useCallback((cfiRange) => {
        if (!viewerRef.current) return;

        const iframe = viewerRef.current.querySelector('iframe');
        if (!iframe) return false;

        const iframeWin = iframe.contentWindow;
        if (!iframeWin) return false;

        const filtered = highlights.filter(h => clashCfiRange(h.cfiRange, cfiRange));

        if (filtered.length > 0) {
            toast.warn("이미 책갈피에 추가된 항목입니다.", {
                position: 'top-center',
                autoClose: 1000,
            });
            iframeWin.getSelection().removeAllRanges();
            return false;
        }

        const position = getSelectionPosition(viewerRef.current, bookStyle, bookFlow, viewerLayout().MIN_VIEWER_WIDTH, viewerLayout().MIN_VIEWER_HEIGHT, viewerLayout().VIEWER_HEADER_HEIGHT, contextmenuWidth);
        if (!position) return false;

        const { x, y, height } = position;
        const content = iframeWin.getSelection().toString().trim();
        if (content.length === 0) return false;

        setSelection({
            update: false,
            x,
            y,
            height,
            cfiRange,
            content
        });

        return true;


    }, [viewerRef, highlights, bookStyle, bookFlow]);

    const onClickHighlight = useCallback((clickedElement, cfiRangeFromEvent) => {
        const targetGElement = clickedElement.closest('g.epub-highlight');
        if (!targetGElement) {
            return;
        }

        const cfiRange = cfiRangeFromEvent;
        if (!cfiRange) {
            return;
        }

        const iframe = viewerRef.current.querySelector('iframe');
        if (!iframe) {

            return;
        }

        const highlightRectInIframe = targetGElement.getBoundingClientRect();

        const viewerScrollTop = viewerRef.current.scrollTop || 0;
        const viewerScrollLeft = viewerRef.current.scrollLeft || 0;


        const finalContextMenuY = highlightRectInIframe.top
                                + viewerScrollTop
                                + highlightRectInIframe.height;


        const finalContextMenuX = highlightRectInIframe.left
                                + viewerScrollLeft
                                + (highlightRectInIframe.width / 2)
                                - (contextmenuWidth / 2);

        setSelection({
            update: true,
            x: finalContextMenuX,
            y: finalContextMenuY,
            height: highlightRectInIframe.height,
            cfiRange,
            content: "",
        });
    }, [viewerRef, setSelection]);



    const onAddHighlight = useCallback((color) => {
        const paragraphCfi = getParagraphCfi(selection.cfiRange);
        if (!paragraphCfi) return;

        const highlightData = {
            ebookId: ebookId,
            createTime: new Date().toLocaleDateString('en-CA'),
            color,
            paragraphCfi,
            cfiRange: selection.cfiRange,
            chapterName: currentLocation.chapterName || '',
            content: selection.content,
        }

        addHighlightMutation.mutate(highlightData);


    }, [selection, currentLocation, ebookId, addHighlightMutation]);

    const onUpdateHighlight = useCallback((highlight, color) => {

        if (!highlight || !highlight.highlightId) return;

        const data = {
            highlightId: highlight.highlightId,
            color: color,
        }

        updateHighlightMutation.mutate(data);
    }, [updateHighlightMutation]);

    const onRemoveHighlight = useCallback((highlightId, cfiRange) => {
        console.log(highlightId, cfiRange);
        if (!viewerRef.current || !highlightId) return;

        // const highlight = highlights.find(h => h.highlightId === highlightId);
        // if (!highlight || !highlight.id) return;


        deleteHighlightMutation.mutate({highlightId, cfiRange});

    }, [viewerRef, deleteHighlightMutation]);

    useEffect(() => {
        if (!viewerRef.current) return;


        const iframe = viewerRef.current.querySelector('iframe');;
        if (!iframe) return;

        const iframeWin = iframe.contentWindow;
        if (!iframeWin) return;



        highlights.forEach(h => {
            const cfiRange = cfiRangeSpliter(h.cfiRange);
            if (!cfiRange) return;

            const { startCfi } = cfiRange;


            if (compareCfi(currentLocation.startCfi, startCfi) < 1 && compareCfi(currentLocation.endCfi, startCfi) > -1) {
                // const node = getNodefromCfi(h.paragraphCfi, iframe);
                // if (!node) return;

                console.log("아아아아아아아앙!")
                viewerRef.current.onHighlight(
                    h.cfiRange,
                    (e) => {
                        onClickHighlight(e.target, h.cfiRange);
                        setIsContextMenu(true);
                    },
                    h.color
                );
                if (justAddRef.current === h.cfiRange) {
                    const iframe = viewerRef.current?.querySelector('iframe');
                    const iframeWin = iframe?.contentWindow;
                    if (iframeWin && iframeWin.getSelection) {
                        iframeWin.getSelection().removeAllRanges();
                    }

                    justAddRef.current = null;
                }
            }
        })
    }, [viewerRef, highlights, currentLocation, onClickHighlight, setIsContextMenu, onRemoveHighlight,  ]);

    useEffect(() => {
    if (!viewerRef.current) return;

    const iframe = viewerRef.current.querySelector('iframe');
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const handleClick = (e) => {
        const selection = iframeDoc.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed) {
                const targetElement = document.body;
                targetElement.focus();
                selection.removeAllRanges();
                iframe.blur();
            }
        }
    };

    iframeDoc.addEventListener('click', handleClick);

    return () => {
        iframeDoc.removeEventListener('click', handleClick);
    };
}, [viewerRef, currentLocation]);



    return {
        selection,
        highlights,
        onSelection,
        onClickHighlight,
        onAddHighlight,
        onUpdateHighlight,
        onRemoveHighlight
    };

}

export default useHighlight;
