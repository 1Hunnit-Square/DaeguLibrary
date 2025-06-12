import DOMPurify from 'dompurify';
import { imgReplace } from "../../util/commonUtil";

const ContentComponent = ({content, className = ""}) => {

    return(
        <div className={`ql-content min-h-50 ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(imgReplace(content)) }} />
    );
}

export default ContentComponent;