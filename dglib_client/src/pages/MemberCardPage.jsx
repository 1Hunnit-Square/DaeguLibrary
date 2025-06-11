import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import QRComponent from "../components/member/QrComponent";
import { useRecoilValue } from "recoil";
import { memberIdSelector, memberNameSelector, memberMnoSelector } from "../atoms/loginState";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MemberCardPage = () => {

    const mid = useRecoilValue(memberIdSelector);
    const name = useRecoilValue(memberNameSelector);
    const mno = useRecoilValue(memberMnoSelector);
    const navigate = useNavigate();

    useEffect(()=>{
    if(!mid){
        alert("로그인이 필요한 서비스입니다.");
        navigate("/");
    }

    },[])

    return(
        <Layout sideOn={false}>
        <SubHeader subTitle="모바일 회원증" mainTitle="기타" />
       <div className="flex justify-center mt-10">
  <div className="w-[90%] max-w-sm bg-white shadow-lg rounded-2xl border border-green-400 p-5">
    <div className="text-center text-green-800 text-xl font-bold mb-4">
      대구도서관 모바일 회원증
    </div>

    <div className="flex flex-row items-start justify-between">
      {/* 왼쪽: 회원 정보 */}
      <div className="flex flex-col space-y-2 text-gray-700 font-medium mt-5">
        <div>
          회원번호 : <span className="font-semibold">{mno}</span>
        </div>
        <div>
          이름 : <span className="font-semibold">{name}</span>
        </div>
      </div>

      {/* 오른쪽: QR 코드 */}
      <div className="px-1">
        <QRComponent mid={mid} />
      </div>
    </div>

    <div className="text-xs text-center text-gray-400 mt-6">
      ※ 이 화면을 도서관 직원에게 보여주세요
    </div>
  </div>
</div>

        </Layout>
    );
}

export default MemberCardPage;