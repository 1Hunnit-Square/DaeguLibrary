import { useState, useEffect, useCallback, useRef } from 'react';


export const useEbookMenu = (ref, delay) => {
    const [eventSignal, setEventSignal ] = useState(true);
    const [control, setControl ] = useState({
        display : false,
        open: false,
    })
    const timeoutRef = useRef(null);

    const onToggle = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (!control.display) {
            setControl({ display: true, open: false });
            timeoutRef.current = window.setTimeout(() => {
                setControl({ display: true, open: true });
            }, 0);
        } else {
            setControl({ display: true, open: false });
            timeoutRef.current = window.setTimeout(() => {
                setControl({ display: false, open: false });
            }, delay - 50);
        }
    }, [control.display, delay]);



    const onClose = useCallback((e) => {
        if (!ref || !ref.current) return;
        if( !ref.current.contains(ref.current)) {
            onToggle();
        }
    }, [ref, onToggle]);

    const emitEvent = useCallback(() => {
		window.setTimeout(() => setEventSignal(true), 300);
	}, [setEventSignal]);

    useEffect(() => {
        if (!eventSignal && !control.display) return;
        const epubIframe = document.querySelector('iframe');
        if (control.display) {
            document.addEventListener('click', onClose);
            if (epubIframe && epubIframe.contentWindow) {
                epubIframe.contentWindow.document.addEventListener('click', onClose);
            }
        } else {
            document.removeEventListener('click', onClose);
            if (epubIframe && epubIframe.contentWindow) {
                epubIframe.contentWindow.document.removeEventListener('click', onClose);
            }
        }
        setEventSignal(false);
        return () => {
            document.removeEventListener('click', onClose);
            if (epubIframe && epubIframe.contentWindow) {
                epubIframe.contentWindow.document.removeEventListener('click', onClose);
            }
        }
    }, [control.display, onClose, eventSignal]);

    return [ control, onToggle, emitEvent ]


}