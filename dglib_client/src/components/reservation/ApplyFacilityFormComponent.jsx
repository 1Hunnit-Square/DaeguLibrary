import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../../atoms/loginState';
import { registerPlace } from '../../api/placeApi';
import axios from 'axios';
import Button from '../common/Button';
import CheckNonLabel from '../common/CheckNonLabel';

// memberApi에 직접 손대기 어려워서 여기에 별도 정의(추후 수정 예정)
const getMemberInfo = async (mid) => {
    const res = await axios.get(`http://localhost:8090/api/member/info/${mid}`);
    return res.data;
};

const ApplyFacilityFormComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomName = location.state?.roomName || '';
    const selectedDate = location.state?.date || '';
    const memberId = useRecoilValue(memberIdSelector);

    const [memberInfo, setMemberInfo] = useState({ name: '', phone: '', address: '' });
    const [durationTime, setDurationTime] = useState([]);
    const [participants, setParticipants] = useState('');
    const [purpose, setPurpose] = useState('');
    const [personCount, setPersonCount] = useState('');
    const [modal, setModal] = useState({ open: false, message: '' });

    useEffect(() => {
        if (memberId) {
            getMemberInfo(memberId).then((data) => {
                setMemberInfo({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                });
            });
        }
    }, [memberId]);


    const timeSlots = [
        '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
        '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    const toggleDuration = (slot) => {
        if (durationTime.includes(slot)) {
            setDurationTime(durationTime.filter(t => t !== slot));
        } else if (durationTime.length < 3) {
            setDurationTime([...durationTime, slot]);
        }
    };

    const isConsecutive = (slots) => {
        const indexes = slots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
        for (let i = 1; i < indexes.length; i++) {
            if (indexes[i] !== indexes[i - 1] + 1) return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!participants.trim()) return setModal({ open: true, message: '참가자 아이디를 입력해 주세요.' });
        if (!purpose.trim()) return setModal({ open: true, message: '사용 목적을 입력해 주세요.' });
        if (!personCount || Number(personCount) <= 0) return setModal({ open: true, message: '이용 인원을(를) 입력해 주세요.' });
        if (durationTime.length === 0) return setModal({ open: true, message: '이용 시간은 1일 최대 3시간입니다.' });

        const sorted = [...durationTime].sort();
        if (!isConsecutive(sorted)) {
            return setModal({ open: true, message: '이용 시간을 선택하세요.' });
        }

        const participantCount = participants.split(',').filter(p => p.trim()).length;
        if (participantCount !== Number(personCount)) {
            return setModal({ open: true, message: '참가자 수와 인원수가 일치하지 않습니다.' });
        }

        if (roomName.includes('동아리') && roomName.includes('세미나')) {
            return setModal({ open: true, message: '하루 중 한 종류의 시설만 예약할 수 있습니다.' });
        }

        const dto = {
            memberMid: memberId,
            room: roomName,
            useDate: selectedDate,
            startTime: sorted[0].split(' - ')[0],
            durationTime: sorted.length,
            people: Number(personCount),
            participants,
            purpose,
        };

        try {
            await registerPlace(dto);
            alert('신청 예약이 완료되었습니다. 내 서재 > 신청내역에서 확인할 수 있습니다.');
            navigate('/reservation/facility');
        } catch (err) {
            const fallback = err.response?.data?.message || '신청 중 오류가 발생했습니다. 다시 시도해 주세요.';
            setModal({ open: true, message: fallback });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 mb-16 px-6 text-sm text-gray-800">
            <section className="mb-10 p-6 bg-white border border-gray-300 rounded-xl">
                <h3 className="text-lg font-bold text-[#00893B] border-b pb-2 mb-4">신청자 기본정보</h3>
                <div className="grid grid-cols-1 gap-4">
                    <input readOnly value={memberInfo.name} className="w-full border px-3 py-2 rounded bg-gray-100" placeholder="성명" />
                    <input readOnly value={memberInfo.phone} className="w-full border px-3 py-2 rounded bg-gray-100" placeholder="휴대폰 번호" />
                    <input readOnly value={memberInfo.address} className="w-full border px-3 py-2 rounded bg-gray-100" placeholder="주소" />
                </div>
            </section>

            <section className="mb-10 p-6 bg-white border border-gray-300 rounded-xl">
                <h3 className="text-lg font-bold text-[#00893B] border-b pb-2 mb-4">이용 신청 정보</h3>
                <div className="space-y-4">
                    <input readOnly value={roomName} className="w-full border px-3 py-2 rounded bg-gray-100" placeholder="시설명" />
                    <input readOnly value={selectedDate} className="w-full border px-3 py-2 rounded bg-gray-100" placeholder="이용일자" />

                    <div>
                        <label className="block font-medium mb-1">✔ 이용인원 <span className="text-xs text-gray-500 ml-2">※ 최소 4인 이상 예약가능 (세미나실은 6인 이상)</span></label>
                        <input type="number" min={1} value={personCount} onChange={e => setPersonCount(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="예: 4" />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">✔ 이용시간 <span className="text-xs text-gray-500 ml-2">※ 1일 최대 3시간까지 연속 선택</span></label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded">
                            {timeSlots.map((slot, idx) => (
                                <label key={idx} className={`inline-flex items-center gap-2 border px-2 py-1 rounded cursor-pointer ${durationTime.includes(slot) ? 'bg-green-600 text-white' : 'bg-white'}`}>
                                    <CheckNonLabel
                                        checked={durationTime.includes(slot)}
                                        onChange={() => toggleDuration(slot)}
                                        inputClassName="w-4 h-4"
                                        disabled={durationTime.length >= 3 && !durationTime.includes(slot)}
                                    />
                                    <span>{slot}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">✔ 참가자 명단 <span className="text-xs text-gray-500 ml-2">※ 참가자 아이디를 입력해 주세요. / 예: user1, user2 (쉼표 구분)</span></label>
                        <textarea value={participants} onChange={(e) => setParticipants(e.target.value)} className="w-full border px-3 py-2 rounded" rows={2} placeholder="참가자 명단을 입력해주세요" />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">✔ 사용 목적</label>
                        <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border px-3 py-2 rounded" rows={3} placeholder="사용 목적을 입력해주세요" />
                    </div>
                </div>
            </section>

            <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                <span className="text-green-700 text-base">ⓘ</span>
                도서관 프로그램 일정에 의해 예약이 취소될 수 있습니다.
            </p>

            <div className='flex flex-col items-center gap-2 mt-6'>
                <div className="flex justify-center gap-3 mb-4">
                    <Button onClick={handleSubmit} className="bg-green-700 hover:bg-green-800">신청하기</Button>
                    <Button onClick={() => navigate(-1)} className="bg-gray-400 hover:bg-gray-500">취소</Button>
                </div>
                <p className='text-xs text-gray-500 text-center'>
                    ※ 예약 확인은 <span className='text-green-700 font-medium'>내서재 &gt; 이용 신청 내역</span> 에서 확인 가능합니다.
                </p>
            </div>

            {modal.open && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden">
                        <div className="flex justify-between items-center bg-green-600 text-white px-4 py-3">
                            <h2 className="text-lg font-semibold">안내</h2>
                            <button
                                onClick={() => setModal({ open: false, message: '' })}
                                className="text-white text-xl hover:text-gray-200 cursor-pointer"
                            >
                                ⨉
                            </button>
                        </div>
                        <div className="px-5 py-6 text-gray-800 text-sm whitespace-pre-line">
                            {modal.message}
                        </div>
                        <div className="px-5 pb-5 flex justify-end">
                            <button
                                onClick={() => setModal({ open: false, message: '' })}
                                className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded cursor-pointer"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplyFacilityFormComponent;