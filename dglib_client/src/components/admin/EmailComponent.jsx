import Download from "../common/Download"

const EmailComponent = () => {

return(
    <>
    <Download link={"http://localhost:8090/api/mail/view/2?fileNum=0"}  fileName="dd.hwp" />
    <img src="http://localhost:8090/api/mail/view/1?fileNum=0&fileType=image" />
    </>
)
}

export default EmailComponent;