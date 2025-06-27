import React from "react";

const PolicyComponent = () => {
    return (
        <div className="max-w-5xl mx-auto mt-20 border border-gray-100 px-6 pt-10 sm:pt-10 md:pt-10 pb-16 bg-white rounded-lg mb-10 shadow-md">
            {/* 비전 */}
            <section className="relative mt-5 text-center py-10 px-6 rounded-2xl shadow-md bg-green-800">
                <p className="text-3xl text-white mt-2 mb-3 leading-relaxed">
                    시민이<br className="sm:hidden" /> 행복한 도서관
                </p>
                <div className="absolute bottom-4 right-4">
                    <img src="/chaticon01.png" alt="꿈틀이" className="w-[20%] md:w-20 h-auto" />
                </div>
            </section>

            {/* 건립배경 */}
            <section>
                <h1 className="text-xl font-bold text-green-700 mb-10 border-b-4 border-green-800 inline-block pb-2 mt-10">
                    건립 배경
                </h1>
                <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white font-semibold text-gray-700 text-center leading-loose">
                    <p>「도서관 법」 제25조 및 제26조에 따라 광역시 차원의 도서관 정책을 수립하고,</p>
                    <p>정보와 문화의 지역격차 해소를 위해 광역 대표도서관으로서 대구 시립도서관 설립</p>
                </div>
            </section>

            {/* 핵심가치 */}
            <section className="mt-18">
                <h1 className="text-xl font-bold text-green-700 mb-10 border-b-4 border-green-800 inline-block pb-2">
                    핵심가치
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <img src="/reading_book.png" alt="책읽는 소년 아이콘" className="w-16 h-16" />
                        <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white mt-3 w-full">
                            <p className="text-gray-700 mt-2 font-semibold">다 함께 누리는 포용과 평등</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <img src="/art_culture.png" alt="문화와 예술 아이콘" className="w-16 h-16" />
                        <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white mt-3 w-full">
                            <p className="text-gray-700 mt-2 font-semibold">모두가 함께하는 문화와 예술</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <img src="/book.png" alt="도서 아이콘" className="w-16 h-16" />
                        <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white mt-3 w-full">
                            <p className="text-gray-700 mt-2 font-semibold">미래를 연결하는 도서관 혁신</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 추진전략 및 추진과제 */}
            <section className="mt-18">
                <h1 className="text-xl font-bold text-green-700 mb-10 border-b-4 border-green-800 inline-block pb-2">
                    추진전략 및 추진과제
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                    {[
                        {
                            title: "모두가 누리는 도서관 환경",
                            bg: "bg-green-100 text-green-800",
                            items: ["도서관 건립 및 공간 재구성", "도서관 장서 환경 개선"]
                        },
                        {
                            title: "문화·예술 중심의 지역공동체",
                            bg: "bg-yellow-100 text-yellow-800",
                            items: [
                                "문화·예술 중심의 고품격 도서관 생태계 조성",
                                "창의·공감을 위한 인문 역량 제고",
                                "사회적 포용의 실천"
                            ]
                        },
                        {
                            title: "미래를 준비하는 디지털 혁신",
                            bg: "bg-blue-100 text-blue-800",
                            items: [
                                "대구를 대표하는 디지털 선도 도서관",
                                "도서관 전문 인력 확충",
                                "도서관 정책 기반 강화"
                            ]
                        },
                        {
                            title: "지역과 사회의 품격 있는 연결",
                            bg: "bg-purple-100 text-purple-800",
                            items: ["도서관 브랜드 이미지 구축", "도서관 네트워크 활성화"]
                        }
                    ].map(({ title, bg, items }, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[220px] flex flex-col"
                        >
                            <div className={`${bg} text-base font-bold py-4 px-4 border-b border-gray-200 text-center whitespace-nowrap overflow-hidden text-ellipsis`}>
                                {title}
                            </div>
                            <div className="bg-white text-gray-800 text-sm px-5 py-5 flex-grow flex flex-col justify-center">
                                <ul className="space-y-5 leading-relaxed">
                                    {items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-green-700 text-xs mr-2">●</span>
                                            <span className="break-keep leading-snug">{item}</span>
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
