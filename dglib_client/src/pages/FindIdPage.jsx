import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";


const FindIdPage = () => {

    const [ isOpen, setIsOpen ] = useState(false);


    const handleClick = () => {
        setIsOpen(true);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    return(
        <Layout sideOn={false}>
            <SubHeader subTitle="아이디 찾기" mainTitle="기타" />
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold my-10 text-center">아이디 찾기</div>
            
                <label className="col-span-1">이름</label>
                <input className = "col-span-2 border rounded w-30" />
                
                <label className="col-span-1">생년월일</label>
                <input type="date" className = "col-span-2 border rounded w-30" />
                 </div>
                 <div className="flex justify-center">
                <Button onClick ={handleClick}>아이디 찾기</Button></div>
                
    <Modal isOpen={isOpen} title={"휴대폰 인증"} onClose={handleClose}>
    {authStep == "phoneAuth" && <PhoneAuthComponent handlePage={handlePage} />}
    {authStep == "phoneCheck" && <PhoneCheckComponent phoneNum={phoneNum} handlePage={handlePage} phoneCheck ={false} handleSuccess = {handleSuccess} />}
    </Modal>
           
        </Layout>
    )

}

export default FindIdPage;