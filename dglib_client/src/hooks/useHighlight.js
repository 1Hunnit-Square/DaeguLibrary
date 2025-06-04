import { useState, useEffect, useCallback } from 'react';
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
        onSuccess: () => {
            queryClient.invalidateQueries(['highlights', ebookId]);
            toast.success("책갈피가 추가되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
            });

             setSelection({ ...selection, update: true });
        },
        onError: (error) => {
            toast.error("책갈피 추가에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
            });
        }
    });

    const updateHighlightMutation = useMutation({
        mutationFn: ({ highlightId, updateData }) => updateHighlight(highlightId, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries(['highlights', ebookId]);
            toast.success("책갈피가 수정되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
            });
        },
        onError: (error) => {
            toast.error("책갈피 수정에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
            });
        }
    });

    const deleteHighlightMutation = useMutation({
        mutationFn: deleteHighlight,
        onSuccess: () => {
            queryClient.invalidateQueries(['highlights', ebookId]);
            toast.success("책갈피가 삭제되었습니다.", {
                position: 'top-center',
                autoClose: 1000,
            });
        },
        onError: (error) => {
            toast.error("책갈피 삭제에 실패했습니다.", {
                position: 'top-center',
                autoClose: 1000,
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
            console.error("하이라이트 <g> 요소를 찾을 수 없습니다. 클릭된 요소:", clickedElement);
            return;
        }

        const cfiRange = cfiRangeFromEvent;
        if (!cfiRange) {
            console.error("CFI Range를 전달받지 못했습니다.");
            return;
        }

        const iframe = viewerRef.current.querySelector('iframe');
        if (!iframe) {
            console.error("Iframe을 찾을 수 없습니다.");
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
            key: paragraphCfi + selection.cfiRange,
            accessTime: new Date().toLocaleDateString('en-CA'),
            createTime: new Date().toLocaleDateString('en-CA'),
            color,
            paragraphCfi,
            cfiRange: selection.cfiRange,
            chapterName: currentLocation.chapterName || '',
            pageNum: currentLocation.currentPage,
            content: selection.content,
        }

        addHighlightMutation.mutate(highlightData);


    }, [selection, currentLocation, ebookId, addHighlightMutation]);

    const onUpdateHighlight = useCallback((highlight, color) => {

        if (!highlight || !highlight.highlightId) return;

        updateHighlightMutation.mutate({
            highlightId: highlight.highlightId,
            updateData: { color }
        });
    }, [updateHighlightMutation]);

    const onRemoveHighlight = useCallback((highlightId, cfiRange) => {
        console.log(highlightId, cfiRange);
        if (!viewerRef.current || !highlightId) return;

        // const highlight = highlights.find(h => h.highlightId === highlightId);
        // if (!highlight || !highlight.id) return;

        deleteHighlightMutation.mutate(highlightId);
        viewerRef.current.offHighlight(cfiRange);
    });

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

                console.log("씨이벌!")


                viewerRef.current.onHighlight(
                    h.cfiRange,
                    (e) => {
                        onClickHighlight(e.target, h.cfiRange);
                        setIsContextMenu(true);
                    },
                    h.color
                );


            }
        })
    }, [viewerRef, highlights, currentLocation, onClickHighlight, setIsContextMenu, onRemoveHighlight,  ]);

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
