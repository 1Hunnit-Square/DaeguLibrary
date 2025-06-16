import React from "react";

const PolicyComponent = () => {
    return (
        <div className="p-6 space-y-10">
            {/* 비전 */}
            <section className="relative mt-5 text-center py-12 px-6 rounded-2xl shadow-md bg-green-600 ">

                <p className="text-3xl font-extrabold text-white mt-2 mb-3 leading-relaxed">
                    시민이<br className="sm:hidden" /> 행복한 도서관
                </p>
                <div className="absolute top-4 text-2xl left-4">🍀</div>

                <div className="absolute bottom-4 right-4">

                    <img src="/chaticon01.png" alt="꿈틀이" className="w-[20%] md:w-20 h-auto" />
                </div>
            </section>

            {/* 건립배경 */}
            <section>
                <h1 className="text-2xl font-bold text-green-800 mb-10 border-b-4 border-green-600 inline-block pb-2">
                    건립배경
                </h1>
                <p className="border border-gray-300 rounded-lg p-4 shadow bg-white text-gray-700">
                    「도서관법」 제25조 및 제26조에 따라 광역시 차원의 도서관 정책을 수립하고,
                    정보와 문화의 지역격차 해소를 위해 광역대표도서관으로서 대구시립도서관 설립.
                </p>
            </section>

            {/* 핵심가치 */}
            <section className="mt-16">
                <h1 className="text-2xl font-bold text-green-800 mb-10 border-b-4 border-green-600 inline-block pb-2">
                    핵심가치
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 text-center">
                    <span className="text-4xl">❤</span>
                    <span className="text-4xl">🖼</span>
                    <span className="text-4xl">📚</span>
                    <div className="border border-gray-300 rounded-lg p-4 shadow bg-white">
                        <p className="text-blue-700 mt-2 mb-2 font-bold">다함께 누리는 포용과 평등</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 shadow bg-white">

                        <p className="text-purple-700 mt-2 mb-2 font-bold">모두가 함께하는 문화와 예술</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 shadow bg-white">

                        <p className="text-green-700 mt-2 mb-2 font-bold">미래를 연결하는 도서관 혁신</p>
                    </div>
                </div>
            </section>

            {/* 추진전략 및 추진과제 */}
            <section className="mt-16">
                <h1 className="text-2xl font-bold text-green-800 mb-10 border-b-4 border-green-600 inline-block pb-2">
                    추진전략 및 추진과제
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            title: "모두가 누리는 도서관 환경",
                            bg: "bg-green-600",
                            emoji: "💚",
                            items: ["도서관 건립 및 공간 재구성", "도서관 장서환경 개선"]
                        },
                        {
                            title: "문화·예술 중심의 지역공동체",
                            bg: "bg-yellow-500",
                            emoji: "💛",
                            items: [
                                "문화·예술 중심의 고품격 도서관 생태계 조성",
                                "창의·공감을 위한 인문역량 제고",
                                "사회적 포용의 실천"
                            ]
                        },
                        {
                            title: "미래를 준비하는 디지털 혁신",
                            bg: "bg-blue-600",
                            emoji: "💙",
                            items: [
                                "대구를 대표하는 디지털 선도 도서관",
                                "도서관 전문인력 확충",
                                "도서관 정책 기반 강화"
                            ]
                        },
                        {
                            title: "지역과 사회의 품격있는 연결",
                            bg: "bg-purple-600",
                            emoji: "💜",
                            items: ["도서관 브랜드 이미지 구축", "도서관 네트워크 활성화"]
                        }
                    ].map(({ title, bg, emoji, items }, idx) => (
                        <div
                            key={idx}
                            className={`border border-gray-300 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 min-h-[280px] flex flex-col`}
                        >
                            {/* 카드 제목 */}
                            <div className={`${bg} text-base font-bold text-white py-4 px-4 border-b text-center border-gray-200`}>
                                {title}
                            </div>

                            {/* 카드 본문 */}
                            <div className="bg-white text-gray-800 text-sm px-5 py-5 flex-grow flex flex-col justify-center">
                                <ul className="space-y-3 leading-relaxed">
                                    {items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-lg mt-0.5">{emoji}</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>




        </div>
    );
};

export default PolicyComponent;
