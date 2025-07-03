import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import PhoneAuthComponent from "./PhoneAuthComponent";
import PhoneCheckComponent from "./PhoneCheckComponent";
import PageModal from "../common/PageModal";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import CheckBox from "../common/CheckBox";
import { checkPhoneId, leaveApply } from "../../api/memberApi";
import { useLogin } from "../../hooks/useLogin";
import { ReceiptRussianRuble } from "lucide-react";

const LeaveComponent = () => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ phone, setPhone ] = useState("");
    const [ agree, setAgree ] = useState(false);
    const mid = useRecoilValue(memberIdSelector);
    const { doLogout } = useLogin();
    const navigate = useNavigate();

        useEffect(()=> {
            const opener = window.opener;
            

            if(!mid || !opener?.leaveMid || opener.leaveMid != mid){
                alert("잘못된 접근입니다.");
                window.close();
                navigate("/", {replace : true});
                return;
            }
        },[]);

        const handlePhoneVerify = (value) => {
            const phoneNum = value.phone;

            checkPhoneId({phone : phoneNum}).then(data => {
                if(data){
                    setPhone(phoneNum);
                } else {
                    alert("인증 정보가 일치하지 않습니다.");
                }


            }).catch(error => {
                console.error("휴대폰 인증에 오류가 발생했습니다.");

            }).finally(()=>{
                setIsOpen(false);
            })
            
        }


        const handleLeaveApply = () => {
            const checkConfirm = confirm("정말로 회원 탈퇴하시겠습니까?")

            if(!checkConfirm){
                return;
            }

            if(!phone){
                alert("휴대폰 인증이 만료되었습니다. 처음부터 다시 시도해주세요.");
                window.close();
                return;
            }

            if(!agree){
                alert("동의 항목에 체크하셔야 탈퇴가 가능합니다.");
                return;
            }

            const paramData = new FormData();
            paramData.append("mid",mid);

            leaveApply(paramData).then((res) => {
                alert("회원 탈퇴를 완료하였습니다.");
                doLogout();
                window.opener.postMessage({leave : true},"*");
                window.close();
                

            }).catch(error => {
                if(error.response.data.message == "EXIST BORROWED BOOKS"){
                    alert("반납되지 않은 도서가 있습니다. 반납 후 탈퇴가 가능합니다.");
                    return;
                }
                alert("회원 탈퇴 처리에 오류가 발생하였습니다.");
            })


        }


    const PageMap = {
    phoneAuth : { component : PhoneAuthComponent},
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess : handlePhoneVerify, phoneCheck : true } }
    }




return(<>
<div className="flex flex-col p-10">
<h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">회원 탈퇴</h2>
         { !phone && <>
         <div className = "border border-gray-100 shadow rounded-xl w-xs mx-auto py-10 my-7">
        <h1 className = "flex text-3xl font-bold my-5 justify-center">휴대폰 인증</h1>
        <img src="/phoneAuth.png" className="w-25 mx-auto my-7 block" />
        <div className = "flex flex-col items-center justify-center gap-7">
        <div className="text-sm text-gray-700 text-center">SMS 문자 전송을 통한<br /> 본인 인증 서비스입니다.</div>
        <Button onClick={()=> setIsOpen(true)}>인증하기</Button>
        </div>
        </div>
        </>
    }
    {phone && <><div className="border border-gray-300 rounded-md px-7 pt-8 pb-10 bg-gray-50 mt-6">
      <h3 className="text-2xl font-bold mb-10 text-center">회원 탈퇴 안내</h3>
        <div className="flex flex-col gap-5">
        <div>
          <strong className="text-lg text-green-700">해당 아이디로는 재가입이 불가능합니다.</strong><br />
          - 회원탈퇴를 신청하시면 해당 아이디는 즉시 탈퇴 처리되며, 이후 해당 아이디는 영구적으로 사용이 중지됩니다.</div>

         <div>
          <strong className="text-lg text-green-700">모든 서비스 신청이 취소되고, 관련된 이력은 즉시 삭제됩니다.</strong><br />
          - 도서 예약, 프로그램 수강 신청, 시설 이용 등 회원 기반 서비스는 모두 자동 취소 처리됩니다.<br />
          - 탈퇴 시 삭제되는 이용 이력 및 정보는 복구가 불가능하며, 이에 따른 불이익에 대해서 도서관은 책임지지 않습니다.<br />
          </div>
          <div>
          <strong className="text-lg text-green-700">대출 도서는 모두 반납 완료 후 탈퇴가 가능합니다.</strong><br />
          - 미반납 도서는 반드시 반납을 완료하셔야 탈퇴가 처리됩니다.<br />
          - 분실 또는 훼손된 도서에 대해서는 별도의 변상 절차가 진행될 수 있습니다.<br />
          </div>
          </div>
    </div>
<div className="my-7 mx-auto">
        <CheckBox
          label="상기 내용을 모두 확인하였으며, 회원 탈퇴에 동의합니다."
          checked={agree}
          onChange={()=>setAgree(prev => !prev)}
        />
    </div>
    <div className="flex justify-center items-center gap-3">
    <Button onClick={handleLeaveApply}>회원탈퇴</Button>
    </div>
    </>}
 </div>
<PageModal isOpen={isOpen} title={"휴대폰 인증"} onClose={()=>setIsOpen(false)} PageMap={PageMap} defaultPage={"phoneAuth"} />
</>)
}

export default LeaveComponent;