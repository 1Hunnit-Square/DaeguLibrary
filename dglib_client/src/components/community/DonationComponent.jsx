import Download from '../common/Download';
import Button from "../common/Button";
const DonationComponent = () => {
    return (
        <div className="max-w-5xl mx-auto px-15 py-15 bg-white rounded-lg shadow-md mt-20 border border-gray-200 mb-10">

            {/* 수집 기간 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/book_loan.png" alt="수집기간" className="w-23 h-23" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">수집 기간</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>연중 수시</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 도서선정 기준 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/unmanned_return.png" alt="도서선정" className="w-25 h-25 mt-4" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">도서 선정 기준</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>대구 지역사를 담은 향토 도서(발행연도 무관)</li>
                        <li>대구 지역 작가 출판 도서(발행연도 무관)</li>
                        <li>기증 일로 최근 5년 이내 출판된 도서 위주</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 등록제외 도서 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/unmanned_loan.png" alt="등록제외" className="w-25 h-25 mt-18" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">등록 제외 도서</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>잡지, 수험서, 문제집, 사전 등</li>
                        <li>전집은 소설류만 가능, 같은 책 여러 권 불가</li>
                        <li>백과사전, 사전, 연감 등의 도서</li>
                        <li>낙서나 훼손된 도서</li>
                        <li>특정 종교에 치우친 도서</li>
                        <li>타 지역 향토자료, 개인의 전기 및 동호회 문집, 홍보자료</li>
                        <li>기타 선정적이거나 도서관 자료로써 부적합한 자료</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 기증방법 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/book_reservation.png" alt="기증방법" className="w-25 h-25" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">기증 방법</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>대구 도서관 직접 방문 기증 위주(우편이나 택배 기증도 가능)</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 기증필요서류 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/unmanned_return.png" alt="기증필요서류" className="w-25 h-25" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">기증 필요서류</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>대구 도서관 정보지원팀(admin@dglib.kro.kr)으로 기부서약서 제출</li>
                        <li>✔ 기부서약서 서식은 아래 다운로드 버튼을 클릭하시어 사용해 주세요.</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 기증문의 */}
            <section className="flex items-start gap-10 mb-10">
                <img src="/data_lost.png" alt="기증문의" className="w-25 h-25" />
                <div>
                    <h3 className="text-2xl text-green-900 font-semibold mb-5">기증 문의</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                        <li>대구 도서관 정보지원팀(☎ 053-269-0711)</li>
                    </ul>
                </div>
            </section>
            <hr className="my-10 border-t border-gray-300" />

            {/* 다운로드 버튼 */}
            <div className="flex justify-center mt-15">
                <div className="inline-block bg-green-700 text-white px-6 py-3 rounded-md shadow hover:bg-green-800 transition text-center text-sm">
                    <Download
                        link="/별지_제22호서식_기부_서약서(도서관법_시행규칙)_대구도서관.hwp"
                        fileName="별지_제22호서식_기부_서약서(도서관법_시행규칙)_대구도서관.hwp"
                        viewName="기부서약서 다운로드"
                        size={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default DonationComponent;