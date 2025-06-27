import Button from "../common/Button";
import { useNavigate } from "react-router-dom";

const MemberShipComponent = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto mt-20 mb-10 border border-gray-100 px-6 pt-10 sm:pt-10 md:pt-10 pb-16 bg-white rounded-lg shadow-md">
            <section className="px-5 py-5 max-w-6xl mx-auto text-gray-800">
                {/* 헤더 영역 */}
                <div className="bg-[#eefbef] p-8 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-green-900 mb-10">회원가입</h1>
                        <div className="text-sm text-gray-800 space-y-2">
                            <p>도서관 회원이 되시면 다양한 자료를 이용하실 수 있고,</p>
                            <p>문화행사 참여와 도서 대출 서비스를 이용하실 수 있습니다.</p>
                        </div>
                    </div>
                    <img src="/signup.png" alt="회원가입 이미지" onClick={() => navigate(`/signup`)} className="hover:cursor-pointer w-23 md:w-23" />
                </div>

                {/* 가입 대상 */}
                <div className="mb-14">
                    <h2 className="text-2xl font-bold text-green-800 mb-6 border-b-4 border-green-700 inline-block pb-2">회원 가입 대상</h2>
                    <ul className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-gray-700 list-disc pl-10 space-y-2 text-sm">
                        <li>대구시에 주민등록이 되어있는 만 14세 이상의 내국인</li>
                        <li>대구시 소재 학교에 재학 중인 학생, 직장에 재직 중인 자</li>
                        <li>대구시 거주 외국인 등록자(등록증 소지자), 국내 체류 외국인 등록자</li>
                    </ul>
                </div>

                {/* 가입 절차 */}
                <div className="mb-14">
                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-5">
                        <h2 className="text-2xl font-bold text-green-800 border-b-4 border-green-700 inline-block pb-2 mb-4 md:mb-0">
                            회원 가입 절차
                        </h2>
                        <Button
                            onClick={() => navigate(`/signup`)}
                            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-2 py-2"
                        >
                            회원가입하기
                        </Button>
                    </div>

                    {/* 온라인 인증 */}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">온라인 인증</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
                            {["STEP 01", "STEP 02", "STEP 03"].map((step, i) => (
                                <div key={i} className="rounded-lg p-5 shadow bg-white border border-gray-300">
                                    <p className="text-green-700 font-bold text-base mb-2">{step}</p>
                                    <p>{["홈페이지 접속 후 회원가입 클릭", "본인인증(휴대폰 인증 또는 아이핀)", "도서관 선택 및 회원정보 입력"][i]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 도서관 방문 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">도서관 방문</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
                            {["STEP 01", "STEP 02", "STEP 03"].map((step, i) => (
                                <div key={i} className="rounded-lg px-3 py-5 shadow bg-white border border-gray-300">
                                    <p className="text-green-700 font-bold text-base mb-2">{step}</p>
                                    <p>{["회원가입 신청서 작성", "도서관 방문 및 구비서류 제출", "회원증 발급 및 도서 대출 서비스 이용"][i]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 구비서류 */}
                <div>
                    <h2 className="text-2xl font-bold text-green-800 mb-6 border-b-4 border-green-700 inline-block pb-2">구비서류 (도서관 방문 시)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center border border-gray-300 shadow-sm">
                            <thead className="bg-gray-200 text-gray-800">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-3">회원 유형</th>
                                    <th className="border border-gray-300 px-4 py-3">구비서류</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {["대구시민(만 14세 이상)", "대구시 재학생", "대구시 재직자", "외국인"].map((type, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-4 py-3 font-medium">{type}</td>
                                        <td className="border border-gray-300 px-4 py-3">
                                            {["신분증(주민등록증, 운전면허증 등)", "학생증 또는 재학증명서 + 신분증", "재직증명서 또는 사원증 + 신분증", "외국인등록증 + 국내 체류 증빙서류"][i]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MemberShipComponent;
