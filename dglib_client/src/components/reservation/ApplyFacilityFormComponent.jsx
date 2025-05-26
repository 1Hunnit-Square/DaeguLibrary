import { API_SERVER_HOST } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import axios from 'axios';

const ApplyFacilityFormComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomName = location.state?.roomName || '';
    const selectedDate = location.state?.date || '';

    const memberId = useRecoilValue(memberIdSelector);

    const [memberInfo, setMemberInfo] = useState({ name: '', phone: '', address: '' });
    const [durationTime, setDurationTime] = useState([]);
    const [participants, setParticipants] = useState('user2,user3,user4,user5');
    const [purpose, setPurpose] = useState('독서 토론');
    const [personCount, setPersonCount] = useState('4');

    useEffect(() => {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('auth='));
        if (cookie) {
            const value = decodeURIComponent(cookie.split('=')[1]);
            try {
                const parsed = JSON.parse(value);
                setMemberInfo({
                    name: parsed.name || '홍길동',
                    phone: parsed.phone || '010-1234-5678',
                    address: parsed.address || '대전광역시 서구',
                });
            } catch (err) {
                console.error('쿠키 파싱 에러:', err);
            }
        } else {
            setMemberInfo({
                name: '홍길동',
                phone: '010-1234-5678',
                address: '대전광역시 서구',
            });
        }
    }, []);

    const toggleDuration = (slot) => {
        if (durationTime.includes(slot)) {
            setDurationTime(durationTime.filter((t) => t !== slot));
        } else if (durationTime.length < 3) {
            setDurationTime([...durationTime, slot]);
        }
    };

    const isConsecutive = (sortedSlots) => {
        const slotIndexes = sortedSlots.map((slot) => timeSlots.indexOf(slot));
        for (let i = 1; i < slotIndexes.length; i++) {
            if (slotIndexes[i] !== slotIndexes[i - 1] + 1) return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (durationTime.length === 0) {
            alert('이용 시간은 1개 이상 선택해 주세요.');
            return;
        }

        const sorted = [...durationTime].sort();
        if (!isConsecutive(sorted)) {
            alert(
                '선택하신 시간대는 연속된 시간이 아닙니다.\n예: 09:00 - 10:00, 10:00 - 11:00, 11:00 - 12:00 처럼 선택해주세요.'
            );
            return;
        }

        const startTime = sorted[0].split(' - ')[0];
        const dto = {
            memberMid: memberId,
            room: roomName,
            useDate: selectedDate,
            startTime,
            durationTime: sorted.length,
            people: Number(personCount),
            participants,
            purpose,
        };

        try {
            const res = await axios.post(`${API_SERVER_HOST}/api/places/register`, dto);
            if (res.status === 200) {
                alert('신청 예약이 완료되었습니다. 내 서재 > 신청내역에서 확인할 수 있습니다.');
                navigate('/reservation/facility');
            } else {
                alert('알 수 없는 오류가 발생했습니다.');
            }
        } catch (err) {
            if (err.response?.status === 400) {
                alert('해당 시간대는 이미 예약된 시설입니다.');
            } else if (err.response?.status === 404) {
                alert('서버에서 등록 API를 찾을 수 없습니다. (404 Not Found)');
            } else {
                alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
            console.error(err);
        }
    };

    const timeSlots = [
        '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
        '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    return (
        <div className="max-w-4xl mx-auto mt-10 mb-10 px-6 text-sm text-gray-800 bg-white border border-gray-200 rounded-md shadow">

            <section className="mb-10">
                <h3 className="text-xl font-semibold mb-5 text-[#00893B] border-b pb-2 mt-2">신청자 기본정보</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-1 font-medium">✔ 성명</label>
                        <input type="text" readOnly value={memberInfo.name} className="w-full border px-3 py-2 rounded bg-gray-50" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 휴대폰 번호</label>
                        <input type="text" readOnly value={memberInfo.phone} className="w-full border px-3 py-2 rounded bg-gray-50" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 주소</label>
                        <input type="text" readOnly value={memberInfo.address} className="w-full border px-3 py-2 rounded bg-gray-50" />
                    </div>
                </div>
            </section>

            <section className="mb-10">
                <h3 className="text-xl font-semibold mb-5 text-[#00893B] border-b pb-2 flex items-center justify-between">
                    이용 신청 정보
                    <span className="text-red-500 text-xs">✔ 표시가 된 곳은 필수 항목입니다.</span>
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">시설명</label>
                        <input type="text" readOnly value={roomName} className="w-full border px-3 py-2 rounded bg-gray-100" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">이용일자</label>
                        <input type="text" readOnly value={selectedDate} className="w-full border px-3 py-2 rounded bg-gray-100" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 이용인원</label>
                        <input
                            type="number"
                            min={1}
                            value={personCount}
                            onChange={(e) => setPersonCount(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="인원 수 입력"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 이용시간</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {timeSlots.map((slot, idx) => (
                                <label key={idx} className={`inline-flex items-center gap-2 border px-2 py-1 rounded cursor-pointer ${durationTime.includes(slot) ? 'bg-green-600 text-white' : 'bg-white'}`}>
                                    <input
                                        type="checkbox"
                                        value={slot}
                                        checked={durationTime.includes(slot)}
                                        onChange={() => toggleDuration(slot)}
                                        disabled={durationTime.length >= 3 && !durationTime.includes(slot)}
                                        className="accent-[#00893B]"
                                    />
                                    <span>{slot}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 참가자 명단</label>
                        <textarea
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            rows={3}
                            placeholder="예: user2,user3,user4,user5"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">✔ 사용 목적</label>
                        <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            rows={3}
                        ></textarea>
                    </div>
                </div>
            </section>

            <p className="text-xs text-gray-500 mb-10 flex items-center gap-2">
                <img src="/alert.png" alt="주의" className="w-4 h-4" />
                도서관 프로그램 일정에 의해 예약이 취소될 수 있습니다.
            </p>

            <div className="flex justify-center gap-4 mt-6 mb-8">
                <button
                    onClick={handleSubmit}
                    className="bg-[#00893B] hover:bg-[#006C2D] text-white px-6 py-2 rounded shadow"
                >
                    신청하기
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded shadow"
                >
                    취소
                </button>
            </div>

            <p className="text-xs text-gray-600 mt-4 mb-8 text-center">
                ※ 예약 확인은{' '}
                <button
                    className="text-[#00893B] underline hover:text-[#006C2D] cursor-pointer"
                    onClick={() => navigate('/mylibrary/usedfacility')}
                >
                    내서재 &gt; 신청내역
                </button>{' '}
                에서 확인 가능합니다.
            </p>

        </div>
    );
};

export default ApplyFacilityFormComponent;