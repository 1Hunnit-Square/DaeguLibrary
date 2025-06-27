const BorrowReturnComponent = () => {
    return (
        <div className="max-w-5xl mx-auto px-15 py-15 bg-white rounded-lg shadow-md mt-20 border border-gray-200 mb-10">

            {/* 도서 대출 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/book_loan.png" alt="도서 대출" className="w-23 h-23 mt-15" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">도서 대출</h3>
                    <p><span className="font-bold text-orange-600">대출자격:</span> 대구 도서관 회원증 발급 회원</p>
                    <p><span className="font-bold text-orange-600">대출권수/기간:</span> 도서 1회 5권 / 최대 7일</p>

                    <p className="mt-6 font-semibold">📌 대출이 불가능한 자료</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-800">
                        <li>참고도서, 정기간행물, 소책자</li>
                        <li>귀중 도서, 고서 및 양서 또는 훼손 우려가 있는 자료</li>
                        <li>도서관 열람 전용으로 지정된 자료</li>
                        <li><span className="text-red-600 font-semibold">반납 자료 당일 재대출 불가</span></li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 도서 반납 */}
            <section className="flex items-start gap-10 mb-15">
                <img src="/book_return.png" alt="도서 반납" className="w-25 h-25 mt-5" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">도서 반납</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>반납 예정일까지 반납</li>
                        <li><span className="text-red-600 font-semibold">반납한 자료는 당일 재대출 불가</span></li>
                        <li>연체 시 연체일 수만큼 대출 일시 정지</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 무인 예약 대출 */}
            <section className="flex items-start gap-10 mb-15">
                <img src="/unmanned_loan.png" alt="무인 예약 대출" className="w-25 h-25 mt-12" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">무인 예약 대출</h3>
                    <p className="mb-2 text-gray-700">
                        대구 도서관 소장 자료를 무인기기를 통해 업무시간 외에도 대출할 수 있는 서비스입니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li><span className="font-semibold text-orange-600">예약 신청:</span> 홈페이지에서 무인예약대출 신청 (1인 5권까지 가능)</li>
                        <li><span className="font-semibold text-orange-600">도서 배출:</span> 화~토요일 16:00~16:30</li>
                        <li><span className="font-semibold text-orange-600">수령 장소:</span> 도서관 1층 출입구 무인예약대출기</li>
                    </ul>
                    <p className="mt-2 text-red-600 font-semibold">※ 반드시 대출 가능 알림 문자 수신 후 방문해 주세요.</p>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 무인 도서 반납 */}
            <section className="flex items-start gap-10 mb-15">
                <img src="/unmanned_return.png" alt="무인 도서 반납" className="w-25 h-25 mt-3" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">무인 도서 반납</h3>
                    <p className="mb-2 text-gray-700">도서관 운영 시간 외에도 무인 반납기를 통해 자료를 반납할 수 있습니다.</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li><span className="font-semibold text-orange-600">설치 장소:</span> 도서관 1층 출입구</li>
                        <li><span className="font-semibold text-orange-600">운영 시간:</span> 연중무휴, 06:00 ~ 02:00</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 대출 연장 */}
            <section className="flex items-start gap-10 mb-15">
                <img src="/loan_extension.png" alt="대출 연장" className="w-25 h-25 mt-5" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">대출 연장</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>예약이 없는 자료에 한하여 1회, 7일 연장 가능</li>
                        <li>연체 자료가 있을 경우 연장 불가</li>
                        <li><span className="text-red-600 font-semibold">희망도서 자료는 연장 불가</span></li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 도서 예약 */}
            <section className="flex items-start gap-10 mb-15">
                <img src="/book_reservation.png" alt="도서 예약" className="w-25 h-25 mt-5" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">도서 예약</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>대출 중인 도서에 한하여 1인 3권까지 예약 가능</li>
                        <li>동일 도서 최대 2명까지 예약 가능</li>
                        <li>반납 후 알림 문자 발송, 미대출 시 자동 취소</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 자료 분실/훼손 */}
            <section className="flex items-start gap-10 mb-5">
                <img src="/data_lost.png" alt="자료 분실/훼손" className="w-25 h-25 mt-1" />
                <div>
                    <h3 className="text-2xl text-green-900 font-bold mb-5">자료 분실/훼손</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>자료를 분실하거나 훼손한 경우 동일 자료로 변상</li>
                        <li>동일 자료가 절판된 경우 유사 주제·가격의 자료로 협의 후 변상</li>
                        <li>변상 완료 전까지 해당 도서관 이용 제한</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default BorrowReturnComponent;
