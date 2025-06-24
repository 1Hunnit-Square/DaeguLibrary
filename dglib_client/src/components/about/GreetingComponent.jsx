import { useState, useEffect, useRef } from 'react';

const GreetingComponent = () => {
    const [isGifVisible, setIsGifVisible] = useState(false);
    const gifRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            setIsGifVisible(true);
                        }, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        if (gifRef.current) {
            observer.observe(gifRef.current);
        }

        return () => {
            if (gifRef.current) {
                observer.unobserve(gifRef.current);
            }
        };
    }, []);

    const timelineData = [
        {
            year: "2025",
            events: [
                { title: "대구 도서관 준공 1월" },
                { title: "백승민 관장 취임 5월" },
                { title: "대구 도서관 개관 7월" }
            ]
        },
        {
            year: "2022",
            events: [
                { title: "7월 대구도서관 착공" }
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 bg-white rounded-lg">
            <section className="mb-16">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-green-800 mb-8 pb-8">
                    대구 도서관 방문을 진심으로 환영합니다.
                </h1>

                <div className="flex flex-col md:flex-row items-start gap-10 mt-12">
                    <div className="md:w-3/4 border border-gray-100 p-10 rounded-2xl shadow-sm text-gray-600 font-semibold space-y-5">
                        <p>2025년 7월에 개관한 대구도서관은 시민의 삶에 풍요와 품격을 더하는 대구광역시의 지식정보와 문화거점 역할을 충실히 수행하고 있습니다.</p>
                        <p>시민이 필요한 정보와 지식을 손쉽게 이용할 수 있도록 풍부한 장서를 구축하고 도서관 간 협력을 통해 대구 광역시 어디에서든 이용에 불편함이 없도록 노력하겠습니다.</p>
                        <p>또한 시민의 평생학습과 문화 향유 기회를 확대하기 위해 다양한 독서문화 프로그램을 제공하겠습니다.</p>
                        <p>도서관은 책뿐 아니라, 사람과 사람이 만나고 지역이 연결되는 따뜻한 공간입니다.</p>
                        <p>대구 도서관은 단순한 지식 전달을 넘어 도서관을 통해 나를 발견하고 꿈을 이룰 수 있는 공간으로 시민과 함께 성장해 나가겠습니다.</p>
                        <p>시민 여러분의 관심과 사랑 부탁드립니다.</p>
                    </div>

                    <div className="md:w-2/5 flex flex-col items-center md:items-end mt-10 md:mt-40">
                        <div className="w-60 h-60 rounded-full overflow-hidden shadow-md mb-5">
                            <img
                                ref={gifRef}
                                src={isGifVisible ? "/director.gif" : "/director.png"}
                                alt="대구 도서관장"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-right">
                            <div className="text-gray-700 mb-1">대구 도서관장</div>
                            <p className="text-xl font-bold">백승민</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-20 pt-20 ">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-green-800 mb-8 pb-4 border-b-2 border-green-700">
                    연혁
                </h1>

                <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-300"></div>

                    {timelineData.map((period, index) => (
                        <div key={index} className="mb-24 relative">
                            <div className="relative">
                                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 z-10">
                                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shadow-md">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 items-center">
                                    {index % 2 === 0 ? (
                                        <>
                                            <div className="text-right pr-8">
                                                <h2 className="text-4xl font-bold text-gray-800">{period.year}</h2>
                                                <div className="mt-4 space-y-2">
                                                    {period.events.map((event, eventIndex) => (
                                                        <div key={eventIndex} className="text-lg text-gray-700 text-right">
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div></div>
                                        </>
                                    ) : (
                                        <>
                                            <div></div>
                                            <div className="pl-8">
                                                <h2 className="text-4xl font-bold text-gray-800">{period.year}</h2>
                                                <div className="mt-4 space-y-2">
                                                    {period.events.map((event, eventIndex) => (
                                                        <div key={eventIndex} className="text-lg text-gray-700">
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default GreetingComponent;