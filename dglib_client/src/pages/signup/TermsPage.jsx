import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import TermsComponent from "../../components/member/TermsComponent";
import { useReactToPrint } from "react-to-print";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const mid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  useEffect(()=>{
    if(mid){
      alert("이미 회원입니다.");
      navigate(-1);
      return;

    }

  },[])

return (
  
<Layout sideOn={false}>
    <SubHeader subTitle="회원가입" mainTitle="기타" print={reactToPrintFn} />
   <div className="p-6 max-w-3xl mx-auto mb-10" ref={contentRef}>
      <h1 className="text-2xl font-bold my-8">회원가입 약관 동의</h1>
      <div className="mb-15">
        대구도서관을 처음 방문하시는 이용자는 신규회원으로 가입 후 해당 도서관에 방문하시어 별도의 <br />
        신청 절차없이 본인확인(신분증 등) 후 도서회원증을 발급 받으실 수 있습니다.
      </div>
    <TermsComponent />
      </div>
</Layout>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
);
}

export default TermsPage;