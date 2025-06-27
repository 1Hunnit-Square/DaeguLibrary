import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { memberIdSelector } from '../../atoms/loginState';
import { useMoveTo } from '../../hooks/useMoveTo';
import { useRecoilValue } from 'recoil';

const BookRequestComponent = () => {
    const mid = useRecoilValue(memberIdSelector);
    const { moveToLogin } = useMoveTo();
    const navigate = useNavigate();
    const handleRequestClick = () => {
        if (!mid) {
            moveToLogin();
            return;
        }
        navigate('/reservation/bookrequest/form');
    };

    return (
        <div className="max-w-5xl mx-auto mt-20 mb-10 border border-gray-100 px-6 pt-10 sm:pt-10 md:pt-10 pb-16 bg-white rounded-lg shadow-md">
           
            <section className="bg-[#eefbef] p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 mb-12 shadow-md">
                <div className="flex-shrink-0">
                    <img src="/requestbook.png" className="w-32 h-32" alt="희망도서신청" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-green-900 mb-2">
                        희망도서신청 안내
                    </h2>
                    <p className="text-base text-gray-700 mb-1">
                        이용하고자 하는 도서가 도서관에 없는 경우 희망 도서를 신청할 수 있습니다.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        신청안내, 진행절차, 선정 제외 도서를 숙지한 후 신청하시기 바랍니다.
                    </p>
                    <Button children="희망도서신청 바로가기" className="h-12 px-6" onClick={handleRequestClick} />
                </div>
            </section>

         
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center h-full">
                    <img src="/eligibility.png" className="w-24 h-24 mb-4" alt="신청 자격" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">신청 자격</h3>
                    <p className="text-base text-gray-700">대구도서관 대출증 발급회원</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center h-full">
                    <img src="/bookcount.png" className="w-24 h-24 mb-4" alt="신청 책수" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">신청 책수</h3>
                    <p className="text-base text-gray-700">1인당 1년 최대 5권</p>
                </div>

                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center h-full">
                    <img src="/process.png" className="w-24 h-24 mb-4" alt="진행 절차" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">진행 절차</h3>
                    <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                        <p>도서 연체나 예약 권수를 초과하면 <br /> 예약이 취소됩니다.</p>
                        <p>ISBN 등 필수 정보를 오기할 경우 <br /> 신청이 취소됩니다.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BookRequestComponent;