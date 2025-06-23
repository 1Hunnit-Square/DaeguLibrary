import { useEffect } from 'react';



const LocationComponent = () => {


    useEffect(() => {
        const { kakao } = window;

        const kakaoMap = () => {
            const container = document.getElementById('map');
            const option = {
                center: new kakao.maps.LatLng(35.842453316043404, 128.59189023238966),
                level: 3
            };
            const map = new kakao.maps.Map(container, option)
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(35.842453316043404, 128.59189023238966)
            });
            marker.setMap(map);
            const zoomControl = new kakao.maps.ZoomControl();
            map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        }

        if(kakao)
        kakao.maps.load(kakaoMap);
        else
        document.getElementById('map').innerText = "카카오 지도가 로드되지 않았습니다.";
    

    }, [])


    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-8xl px-4">

                <div className="mt-10 mb-8 mx-auto  rounded-lg overflow-hidden shadow-lg border max-w-6xl item-center justify-center border-gray-200">
                    <div id="map" className="w-full h-[500px] flex justify-center items-center"></div>
                </div>


                <div className="mb-10 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold pb-3 border-b border-[#00893B]">대구 도서관</h2>

                        <div className="mt-4 space-y-3">
                            <div className="flex py-1 items-center">
                                <div className="w-28 font-medium text-[20px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    주소
                                </div>
                                <div className="ml-8">대구광역시 남구 대명동 68-2</div>
                            </div>

                            <div className="flex py-1 items-center">
                                <div className="w-28 font-medium text-[20px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    전화번호
                                </div>
                                <div className="ml-8">053) 269 - 3513</div>
                            </div>

                            <div className="flex py-1 items-center">
                                <div className="w-28 font-medium text-[20px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18v12H3zM5 6h14v2H5zM17 8v4H7V8zM7 12h10v4H7zM9 15a1 1 0 100 2 1 1 0 000-2zM11 15a1 1 0 100 2 1 1 0 000-2zM13 15a1 1 0 100 2 1 1 0 000-2zM15 15a1 1 0 100 2 1 1 0 000-2zM19 17l2 2" />

                                    </svg>
                                    팩스
                                </div>
                                <div className="ml-8">053) 269 - 3530</div>
                            </div>
                            <div className="flex py-1 items-center">
                                <div className="w-28 font-medium text-[20px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                    </svg>
                                    홈페이지
                                </div>
                                <div className="ml-8">http://daegulibrary.com</div>
                            </div>
                            <div className="flex py-1 items-center">
                                <div className="w-28 font-medium text-[20px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18v12H3zM3 5v2h18V5zM3 17v2h18v-2zM5 17v2h2v-2H5zM17 17v2h2v-2h-2zM5 19a1 1 0 100 2 1 1 0 000-2zM19 19a1 1 0 100 2 1 1 0 000-2zM3 7h2v6H3zM19 7h2v6h-2z" />
                                    </svg>
                                    버스
                                </div>
                                <div className="ml-8">349번, 405번, 564번, 남구 1-1, 순환 3-1</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationComponent;