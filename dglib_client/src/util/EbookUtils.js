import { EpubCFI } from 'epubjs'



export const compareCfi = (cfi_1, cfi_2) => {

    const epubcfi = new EpubCFI();


    return epubcfi.compare(cfi_1, cfi_2);
}


export const getParagraphCfi = (cfiRange) => {
    if (!cfiRange) return;

    const content = cfiRange.slice(8, -1);
    const [origin, start, end] = content.split(',');
    if (!origin || !start || !end) return null;

    const cfi = `epubcfi(${origin})`
    return cfi
}

export const cfiRangeSpliter = (cfiRange) => {
    const content = cfiRange.slice(8, -1);
    const [origin, start, end] = content.split(',');
    if (!origin || !start || !end) return null;
    const startCfi = `epubcfi(${origin + start})`;
    const endCfi = `epubcfi(${origin + end})`;
    return { startCfi, endCfi  }
}

export const clashCfiRange = (baseCfiRange, targetCfiRange) => {
    const splitCfi1 = cfiRangeSpliter(baseCfiRange);
    const splitCfi2 = cfiRangeSpliter(targetCfiRange);
    if (!splitCfi1 || !splitCfi2) return null;
    const { startCfi: s1, endCfi: e1 } = splitCfi1;
    const { startCfi: s2, endCfi: e2 } = splitCfi2;

    if((compareCfi(s2, s1) <= 0 && compareCfi(s1, e2) <= 0)
        || (compareCfi(s2, e1) <= 0 && compareCfi(e1, e2) <= 0)
        || (compareCfi(s1, s2) <= 0 && compareCfi(e2, e1) <= 0)) {
        return true;
        }
    return false;
}

export const getSelectionPosition = (viewer, bookStyle, bookFlow, MIN_VIEWER_WIDHT, MIN_VIEWER_HEIGHT, VIEWER_HEADER_HEIGHT, CONTEXTMENU_WIDTH) => {
    const { innerWidth: windowWidth, innerHeight: windowHeight  } = window;
    const iframeWidth = viewer.offsetWidth;
    const scrollTop = viewer.querySelector('div').scrollTop;
    const iframe = viewer.querySelector('iframe');
    const selection_ = iframe && iframe.contentWindow && iframe.contentWindow.getSelection();
    if(!selection_ || !selection_.rangeCount) return null;

    const range =selection_.getRangeAt(0);

    const { x: selectionX, y: selectionY, height: selectionHeight, width: selectionWidth } = range.getBoundingClientRect();

    const marginLeft =  ~~((windowWidth - MIN_VIEWER_WIDHT) / 100 * bookStyle.marginHorizontal / 2);
    const marginTop = bookFlow === 'scrolled-doc' ? 0 : ~~((windowHeight - MIN_VIEWER_HEIGHT) / 100 * bookStyle.marginVertical / 2);

    const x = ~~(selectionX % iframeWidth + marginLeft + ( selectionWidth / 2  - CONTEXTMENU_WIDTH / 2));
    const y = ~~(selectionY + selectionHeight + VIEWER_HEADER_HEIGHT + marginTop - scrollTop);
    return {x, y, height: selectionHeight, width: selectionWidth }; // 8px padding for context menu

}

export const getNodefromCfi = (cfi, currentIframe) => {
    if (!cfi || typeof cfi !== 'string' || !cfi.startsWith("epubcfi(")) {
        console.error("Invalid CFI string:", cfi);
        return null;
    }


    let path = cfi.substring(8, cfi.length - 1);


    path = path.replace(/\[.*?\]/g, '');


    path = path.replace(/:\d+$/, '');

    const parts = path.split('!');
    if (parts.length < 2 || !parts[1]) {
        console.error("Invalid CFI path structure after '!' :", path);
        return null;
    }

    const contentPath = parts[1];
    const steps = contentPath.split('/').slice(1);

    const iframeToUse = currentIframe || document.querySelector('iframe');
    if (!iframeToUse) {
        console.error("Iframe not found.");
        return null;
    }

    const doc = iframeToUse.contentDocument || iframeToUse.contentWindow?.document;
    if (!doc || !doc.body) {
        console.error("Iframe document or body not found.");
        return null;
    }

    let currentNode = doc.body;

    for (let i = 0; i < steps.length; i++) {
        const step = parseInt(steps[i], 10);
        if (isNaN(step) || step <= 0) {
            console.error("Invalid CFI step:", steps[i], "in", cfi);
            return null;
        }


        let childElementCount = 0;
        let targetNode = null;
        let found = false;

        if (!currentNode || !currentNode.childNodes || currentNode.childNodes.length === 0) {
            console.error("Current node has no childNodes at step:", steps[i], "CFI:", cfi, "CurrentNode:", currentNode);
            return null;
        }

        const childNodesArray = Array.from(currentNode.childNodes);

        for (let j = 0; j < childNodesArray.length; j++) {
            const child = childNodesArray[j];


            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child;
                if (el.dataset.epubcfi && (el.classList.contains('epub-highlight') || el.dataset.bookmark)) {

                    continue;
                }
            }

            childElementCount++;

            if (childElementCount === step) {




                targetNode = child;
                found = true;
                break;
            }
        }


        if (!found || !targetNode) {
            console.error("Failed to find node for step:", step, "(actual count:", childElementCount, ") in CFI:", cfi, "Parent:", currentNode);

            return null;
        }
        currentNode = targetNode;
    }
    return currentNode;
};