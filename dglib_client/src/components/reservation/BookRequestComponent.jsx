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
    }
    return (
        <div>
            <div className="border border-gray-300 drop-shadow-lg bg-gray-200 flex mt-8 p-6 gap-8 items-center">
                <div className="flex-shrink-0">
                    <img src="/requestbook.png" className="w-32 h-32" alt="희망도서신청" />
                </div>
                <div className="space-y-4">
                    <div className="text-2xl">
                        <span className="font-bold">희망도서신청</span> 안내
                    </div>
                    <div>
                        <p className="mb-1 text-sm">이용하고자 하는 도서가 도서관에 없는 경우 희망 도서를 신청할 수 있습니다.</p>
                        <p className="text-sm">신청안내, 진행절차, 선정 제외 도서를 숙지한 후 신청하시기 바랍니다.</p>
                    </div>
                    <Button children="희망도서신청 바로가기" className="h-12 px-6" onClick={handleRequestClick}/>
                </div>
            </div>
            <div className="border border-gray-300 drop-shadow-lg bg-gray-200 flex mt-8 p-6 gap-8 items-center">
                <div className="flex-shrink-0">
                   <img src="/eligibility.png" className="w-32 h-32" alt="신청 자격" />
                </div>
                 <div className="space-y-4">
                    <div className="text-2xl font-bold">
                        신청 자격
                    </div>
                    <div>
                        <p className="text-lg">대구도서관 대출증 발급회원</p>
                    </div>
                </div>
            </div>
          <div className="border border-gray-300 drop-shadow-lg bg-gray-200 flex mt-8 p-6 gap-8 items-center">
                <div className="flex-shrink-0">
                    <img src="/bookcount.png" className="w-32 h-32" alt="신청 책수" />
                </div>
                <div className="space-y-4">
                    <div className="text-2xl font-bold">
                        신청 책수
                    </div>
                    <div>
                        <p className="text-lg">1인당 1년 최대 5권</p>
                    </div>
                </div>
            </div>
            <div className="border border-gray-300 drop-shadow-lg bg-gray-200 flex mt-8 p-6 gap-8 items-center">
                <div className="flex-shrink-0">
                    <img src="/process.png" className="w-32 h-32" alt="진행 절차" />
                </div>
                <div className="space-y-4">
                    <div className="text-2xl font-bold">
                        진행 절차
                    </div>
                    <div className="text-base">
                        <p className="mb-1">도서 연체나 예약 권수를 초과하면 예약이 취소됩니다.</p>
                        <p>ISBN 등 필수 정보를 오기할 경우 신청이 취소됩니다.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}


export default BookRequestComponent;