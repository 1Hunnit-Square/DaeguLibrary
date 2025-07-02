import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import QRComponent from "../components/member/QRComponent";
import { useRecoilValue } from "recoil";
import { memberIdSelector, memberNameSelector, memberMnoSelector } from "../atoms/loginState";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMemberBasicInfo } from "../api/memberApi";
import { useMoveTo } from "../hooks/useMoveTo";
import _ from "lodash";

const MemberCardPage = () => {

    const mid = useRecoilValue(memberIdSelector);
    const name = useRecoilValue(memberNameSelector);
    const mno = useRecoilValue(memberMnoSelector);
    const [ info, setInfo ] = useState({});
    const { moveToLogin } = useMoveTo();

    useEffect(()=>{
    if(!mid){
        moveToLogin();
    }

    getMemberBasicInfo().then(res => {
      setInfo({
        birthDate : res.birthDate,
        phone : res.phone
      })


    }).catch(error => console.error(error))

    },[])

    return(
        <Layout sideOn={false}>
        <SubHeader subTitle="모바일 회원증" mainTitle="기타" />
       <div className="flex justify-center my-10">
  { !_.isEmpty(info) && <div className="bg-white shadow-lg rounded-2xl border border-green-400 px-3 py-4 sm:p-5">
    <div className="text-center text-green-800 text-xl font-bold mb-4">
      대구도서관 모바일 회원증
    </div>

    <div className="flex flex-row items-start justify-between gap-1 sm:gap-12">
      {/* 왼쪽: 회원 정보 */}
      <div className="flex flex-col space-y-2 text-gray-700 font-medium p-2 text-sm sm:text-base">
        <div>
          회원번호 : <span className="font-semibold ml-1.5">{mno}</span>
        </div>
        <div>
          이름 : <span className="font-semibold ml-1.5">{name}</span>
        </div>
        <div>
          생년월일 : <span className="font-semibold ml-1.5">{info?.birthDate?.replace(/-/g,".")}</span>
        </div>
        <div>
          연락처 : <span className="font-semibold ml-1.5">{info?.phone}</span>
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
  </div>}
</div>

        </Layout>
    );
}

export default MemberCardPage;