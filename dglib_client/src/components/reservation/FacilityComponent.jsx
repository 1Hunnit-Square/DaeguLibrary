import { Outlet, useNavigate } from "react-router-dom";
import { memberIdSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import { useRecoilValue } from "recoil";

const FacilityComponent = () => {

  const navigate = useNavigate();
  const { moveToLogin } = useMoveTo();
  const mid = useRecoilValue(memberIdSelector);

  const handleReserve = (roomName) => {

    if (!mid) {
      alert("로그인 후 이용해주세요.");
      moveToLogin("로그인 후 이용해주세요.");
      return;
    }
    navigate("/reservation/facility/apply", { state: { roomName } });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
      <section className="bg-[#e5f5ec] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-2 leading-relaxed">
            대구도서관 시설이용신청 안내
          </h2>
          <div className="w-10 border-b-2 border-green-800 mb-4"></div>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed tracking-wide">
            대구도서관의 시설은 시민 누구나 자유롭게 이용하실 수 있습니다. <br />
            시설 이용을 희망하시는 시민 여러분의 많은 참여를 부탁드립니다.
          </p>
        </div>

        <div className="flex-shrink-0">
          <img
            src="/facility_info.png" alt="안내 아이콘" className="w-full md:w-75 h-auto"
          />
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
          이용시간
        </h3>
        <ul className="text-sm md:text-base text-gray-700 leading-relaxed tracking-wide space-y-2">
          <li>
            <span className="text-blue-200">●</span> 동아리실: 평일 및 주말 (09:00 ~ 17:00)
          </li>
          <li>
            <span className="text-blue-200">●</span> 세미나실: 평일 및 주말 (09:00 ~ 17:00)
          </li>
        </ul>

        <div className="mt-4 space-y-2 text-sm md:text-base">
          <p className="text-gray-800">
            <span className="text-green-600 font-bold mr-2">✔</span> 하루 최대 3시간 이용 가능합니다.
          </p>
          <p className="text-gray-800">
            <span className="text-green-600 font-bold mr-2">✔</span> 독서토론 및 독서진흥 활동을 위한 목적외 정치, 종교, 영리, 개인 목적으로는 대관신청이 불가능합니다.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
          참고 및 주의사항
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex items-start gap-4">
            <img src="/caution_1_fan.png" alt="냉난방 안내 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              냉·난방 가동은 도서관 전체 냉·난방이 운영될 때에 한하며, <br />이용시설공간 사용은 무료
            </p>
          </div>
          <div className="flex items-start gap-4">
            <img src="/caution_2_phrase.png" alt="비품 준비 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              이용시설공간에 설치된 시설물을 제외하고, 행사에 필요한 비품은 사용자가 준비
            </p>
          </div>
          <div className="flex items-start gap-4">
            <img src="/caution_3_safety.png" alt="안전 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              사용자는 사용시간 내 각종 사건 사고에 대비한 사전 안전 조치를 하여야 함
            </p>
          </div>
          <div className="flex items-start gap-4">
            <img src="/caution_4_repair.png" alt="원상복구 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              사용 중 시설물 파손 및 도난 등 문제 발생 시 사용자 원상복구
            </p>
          </div>
          <div className="flex items-start gap-4">
            <img src="/caution_5_block.png" alt="금지 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              이용목적과 어긋나는 상업행위 및 정치, 종교교육 활동 등 금지
            </p>
          </div>
          <div className="flex items-start gap-4">
            <img src="/caution_6_card.png" alt="회원증 아이콘" className="w-8 h-8 mt-1" />
            <p className="text-sm text-gray-700 leading-snug">
              시설공간 이용 시 도서관 회원증을 반드시 지참
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
          이용방법
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="border border-gray-300 rounded-md overflow-hidden text-center w-full md:w-60 shadow-sm">
            <div className="bg-white text-sm font-semibold text-gray-700 py-2 border-b border-gray-200">STEP 01</div>
            <div className="bg-yellow-50 text-gray-800 text-sm px-4 py-3 leading-snug">
              회원가입 후 홈페이지에서 <br /> 시설이용 신청
            </div>
          </div>

          <div className="text-3xl text-green-700 font-bold hidden md:block">→</div>

          <div className="border border-gray-300 rounded-md overflow-hidden text-center w-full md:w-60 shadow-sm">
            <div className="bg-white text-sm font-semibold text-gray-700 py-2 border-b border-gray-200">STEP 02</div>
            <div className="bg-yellow-50 text-gray-800 text-sm px-4 py-3 leading-snug">
              도서관 회원증을 태깅하여 <br /> 예약시간 내 출입 가능
            </div>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
          이용시설공간
        </h3>
        <table className="w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b text-center">구분</th>
              <th className="px-4 py-3 border-b text-center">층</th>
              <th className="px-4 py-3 border-b text-center">용도</th>
              <th className="px-4 py-3 border-b text-center">인원수(명)</th>
              <th className="px-4 py-3 border-b text-center">예약</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr className="border-t">
              <td className="px-4 py-3 text-center">동아리실</td>
              <td className="px-4 py-3 text-center">2층</td>
              <td className="px-4 py-3 text-center">동아리 활동 등</td>
              <td className="px-4 py-3 text-center">8</td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => handleReserve("동아리실")} className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-1 rounded cursor-pointer">
                  바로예약
                </button>
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-3 text-center">세미나실</td>
              <td className="px-4 py-3 text-center">3층</td>
              <td className="px-4 py-3 text-center">세미나 활동 등</td>
              <td className="px-4 py-3 text-center">12</td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => handleReserve("세미나실")} className="bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-1 rounded cursor-pointer">
                  바로예약
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <Outlet />
    </div>
  );
};

export default FacilityComponent;
