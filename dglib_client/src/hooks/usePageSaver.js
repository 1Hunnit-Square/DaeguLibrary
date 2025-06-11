import { useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { saveCurrentPage, getCurrentPage } from '../api/memberApi';
import { toast } from 'react-toastify';



const usePageSaver = (ebookId, currentLocation, viewerRef) => {
    const saveTimeoutRef = useRef(null);
    const lastSavedCfi = useRef(null);
    const hasRestoredRef = useRef(false);
    const isRestoring = useRef(false);

    const { data: savedPage } = useQuery({
        queryKey: ['currentPage', ebookId],
        queryFn: () => getCurrentPage(ebookId),
        enabled: !!ebookId,
        retry: false,
        refetchOnWindowFocus: false,

    });

    const savePageMutation = useMutation({
        mutationFn: saveCurrentPage,
        onSuccess: () => {
            console.log('페이지 자동 저장됨');
            toast.success('페이지가 자동으로 저장되었습니다.', {
                position: 'top-center',
                autoClose: 1000,
                pauseOnHover: false,
                pauseOnFocusLoss: false,
                hideProgressBar: true,
            });
        },
        onError: (error) => {
            console.error('페이지 저장 실패:', error);
        }
    });

    const savePage = useCallback((startCfi) => {
        if (!ebookId || !startCfi) return;
        if (lastSavedCfi.current === startCfi) return;

        if (isRestoring.current || (savedPage && !hasRestoredRef.current)) {
            return;
        }
        const pageData = {
            ebookId,
            startCfi,
        };
        savePageMutation.mutate(pageData);
        lastSavedCfi.current = startCfi;
    }, [ebookId, savePageMutation, savedPage]);

    const restorePosition = useCallback(() => {
        if (hasRestoredRef.current) {
            return;
        }


    if (savedPage && viewerRef.current) {
         isRestoring.current = true;

        try {
            const result = viewerRef.current.setLocation(savedPage);

            hasRestoredRef.current = true;
            isRestoring.current = false;
        } catch (error) {

            isRestoring.current = false;
        }
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