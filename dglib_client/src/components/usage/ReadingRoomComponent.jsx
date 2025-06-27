import React from "react";

const ReadingRoomComponent = () => {
  return (
    <div className="max-w-5xl mx-auto mt-20 mb-10 border border-gray-100 px-6 pt-10 sm:pt-10 md:pt-10 pb-16 bg-white rounded-lg shadow-md">
      {/* 안내 헤더 */}
      <section className="bg-[#eefbef] p-6 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-10">
            대구 도서관 자료실 안내
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed tracking-wide">
            도서관의 자료실은 연령별, 목적별로 구분되어 다양한 정보 서비스를 제공합니다.
          </p>
        </div>
        <div className="flex-shrink-0">
          <img
            src="/readingRoom_info.png"
            alt="도서관 안내"
            className="w-full md:w-60 h-auto"
          />
        </div>
      </section>

      {/* 종합 이용시간 */}
      <section className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4 border-b-4 border-green-700 inline-block pb-2">이용 시간</h3>
        <ul className="text-sm md:text-base text-gray-700 leading-relaxed space-y-2">
          <li>📖 평일 (화~금): 09:00 ~ 21:00</li>
          <li>📚 주말 (토/일): 09:00 ~ 18:00</li>
          <li>🔔 매주 월요일은 정기 휴관일입니다.</li>
        </ul>
      </section>

      {/* 자료실별 이용시간 표 */}
      <section className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4 border-b-4 border-green-700 inline-block pb-2">자료실별 이용 시간</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 text-gray-700 text-center">
              <tr>
                <th className="border border-gray-300 px-3 py-2">위치</th>
                <th className="border border-gray-300 px-3 py-2">이용대상</th>
                <th className="border border-gray-300 px-3 py-2">평일</th>
                <th className="border border-gray-300 px-3 py-2">주말</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr>
                <td className="border border-gray-300 px-3 py-2">3층</td>
                <td className="border border-gray-300 px-3 py-2">자료실 3·4</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 21:00</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 18:00</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">2층</td>
                <td className="border border-gray-300 px-3 py-2">자료실 1·2</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 21:00</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 18:00</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">1층</td>
                <td className="border border-gray-300 px-3 py-2">어린이자료실</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 18:00</td>
                <td className="border border-gray-300 px-3 py-2">09:00 ~ 18:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 어린이자료실 안내 */}
      <section className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4 border-b-4 border-green-700 inline-block pb-2">어린이자료실 (1층)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <img src="/childroom2.png" alt="어린이자료실1" className="w-full h-48 object-cover rounded shadow" />
          <img src="/childroom1.png" alt="어린이자료실2" className="w-full h-48 object-cover rounded shadow" />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          영·유아부터 초등학생 및 보호자를 위한 열람 및 대출 공간입니다. <br />
          독서교육 및 문화 프로그램도 함께 운영됩니다. <br />
          <strong>이용 시간:</strong> 09:00 ~ 18:00 (화~일)
        </p>
      </section>

      {/* 일반자료실 안내 */}
      <section>
        <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4 border-b-4 border-green-700 inline-block pb-2">자료실 1·2·3·4 (2~3층)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <img src="/readingroom1.png" alt="자료실1" className="w-full h-48 object-cover rounded shadow" />
          <img src="/readingroom2.png" alt="자료실2" className="w-full h-48 object-cover rounded shadow" />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          일반 도서 열람 및 대출을 위한 공간으로 조용하고 쾌적한 독서 환경을 제공합니다. <br />
          <strong>이용 시간:</strong> 평일 09:00~21:00 / 주말 09:00~18:00
        </p>
      </section>
    </div>
  );
};

export default ReadingRoomComponent;
