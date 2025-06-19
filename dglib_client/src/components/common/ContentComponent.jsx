import DOMPurify from 'dompurify';
import { emailReplace, imgReplace } from "../../util/commonUtil";

const ContentComponent = ({content, className = "", type="board"}) => {

    return(<>
       {type == "board" && <div className={`ql-content min-h-50 ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(imgReplace(content)) }} />}
       {type == "email" && <div className={`ql-content min-h-50 ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailReplace(content)) }} />}
    </>);
}

export default ContentComponent;