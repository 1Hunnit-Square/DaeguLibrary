const FacilityComponent = () => {

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
    </div>
  );
};

export default FacilityComponent;
