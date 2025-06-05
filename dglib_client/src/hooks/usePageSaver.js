import { useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { saveCurrentPage, getCurrentPage } from '../api/memberApi';



const usePageSaver = (ebookId, currentLocation, viewerRef) => {
    const saveTimeoutRef = useRef(null);
    const lastSavedCfi = useRef(null);

    const { data: savedPage } = useQuery({
        queryKey: ['currentPage', ebookId],
        queryFn: () => getCurrentPage(ebookId),
        enabled: !!ebookId,
        retry: false,
    });

    const savePageMutation = useMutation({
        mutationFn: saveCurrentPage,
        onSuccess: () => {
            console.log('페이지 자동 저장됨');
        },
        onError: (error) => {
            console.error('페이지 저장 실패:', error);
        }
    });

    const savePage = useCallback((startCfi) => {
        if (!ebookId || !startCfi) return;
        if (lastSavedCfi.current === startCfi) return;

        const pageData = {
            ebookId,
            startCfi,
        };

        savePageMutation.mutate(pageData);
        lastSavedCfi.current = startCfi;
    }, [ebookId, savePageMutation]);

    const restorePosition = useCallback(() => {
    console.log('restorePosition 호출됨');
    console.log('savedPage:', savedPage);
    console.log('viewerRef.current:', viewerRef.current);

    if (savedPage && viewerRef.current) {
        console.log('저장된 위치로 이동 시도:', savedPage);
        console.log('viewerRef.current.setLocation 타입:', typeof viewerRef.current.setLocation);

        try {
            const result = viewerRef.current.setLocation(savedPage);
            console.log('setLocation 결과:', result);
        } catch (error) {
            console.error('setLocation 에러:', error);
        }
    } else {
        console.log('조건 불만족:', {
            hasSavedPage: !!savedPage,
            hasViewerRef: !!viewerRef.current
        });
    }
}, [savedPage, viewerRef]);


    useEffect(() => {
        if (!currentLocation.startCfi) return;


        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }


        saveTimeoutRef.current = setTimeout(() => {
            savePage(currentLocation.startCfi);
        }, 5000);


        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [currentLocation.startCfi, savePage]);

    return {
        savedPage,
        restorePosition,
    };
};

export default usePageSaver;