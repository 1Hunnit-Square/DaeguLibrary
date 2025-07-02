import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberIdSelector, memberNameSelector } from '../../atoms/loginState';
import { registerPlace } from '../../api/placeApi';
import { API_SERVER_HOST } from '../../api/config';
import axios from 'axios';
import Button from '../common/Button';
import CheckNonLabel from '../common/CheckNonLabel';
import { API_ENDPOINTS } from '../../api/config';
import { getMemberBasicInfo } from '../../api/memberApi';

// 참가자 명단 아이디 검사
const validateParticipantIds = async (mids) => {
    const res = await axios.post(`${API_SERVER_HOST}${API_ENDPOINTS.member}/validate`, mids);
    return res.data;
};

// 사용 목적 유효성 검사
const isPurposeValid = (purpose) => {
    const trimmed = purpose.trim();
    if (trimmed.length < 3) return false;       // 최소 3글자 이상
    if (/^\d+$/.test(trimmed)) return false;    // 숫자만 입력된 경우
    if (/^(.)\1+$/.test(trimmed)) return false; // 반복된 문자만 입력된 경우

    return true;
};

// 중복 아이디 체크 함수
const findDuplicateIds = (array) => {
    const counts = {};
    const duplicates = [];
    array.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
    });
    for (const [id, count] of Object.entries(counts)) {
        if (count > 1) duplicates.push(id);
    }
    return duplicates;
};


const ApplyFacilityFormComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomName = location.state?.roomName || '';
    const selectedDate = location.state?.date || '';
    const memberId = useRecoilValue(memberIdSelector);
    const memberName = useRecoilValue(memberNameSelector);

    const [memberInfo, setMemberInfo] = useState({ name: '', phone: '', address: '' });
    const [durationTime, setDurationTime] = useState([]);
    const [reservedSlots, setReservedSlots] = useState([]);
    const [participants, setParticipants] = useState('');
    const [purpose, setPurpose] = useState('');
    const [personCount, setPersonCount] = useState('');

    useEffect(() => {
        if (memberId) {
            getMemberBasicInfo().then((data) => {
                setMemberInfo({
                    name: memberName || '',
                    phone: data.phone || '',
                    address: data.addr || '',
                });
            });
        }
    }, [memberId]);

    useEffect(() => {
        if (roomName && selectedDate) {
            const fetchReservedTimes = async () => {
                try {
                    const res = await axios.get(`${API_SERVER_HOST}${API_ENDPOINTS.place}/time-status`, {
                        params: { room: roomName, date: selectedDate },
                    });
                    const reserved = [];
                    res.data.forEach(item => {
                        const startHour = parseInt(item.startTime.split(':')[0], 10);
                        for (let i = 0; i < item.durationTime; i++) {
                            const timeSlot = `${String(startHour + i).padStart(2, '0')}:00 - ${String(startHour + i + 1).padStart(2, '0')}:00`;
                            reserved.push(timeSlot);
                        }
                    });
                    setReservedSlots(reserved);
                } catch (err) {
                    console.error('예약된 시간 불러오기 실패:', err);
                }
            };
            fetchReservedTimes();
        }
    }, [roomName, selectedDate]);

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
        if (!participants.trim()) return alert('참가자 아이디를 입력해 주세요.');
        if (!purpose.trim()) return alert('사용 목적을 입력해 주세요.');
        if (!isPurposeValid(purpose)) return alert('사용 목적은 3글자 이상으로 입력해 주세요.');
        if (!personCount || Number(personCount) <= 0) return alert('이용 인원을(를) 입력해 주세요.');

        const count = Number(personCount);
        if (roomName === '동아리실' && (count < 4 || count > 8)) return alert('동아리실은 4인 이상 8인 이하만 예약할 수 있습니다.');
        if (roomName === '세미나실' && (count < 6 || count > 12)) return alert('세미나실은 6인 이상 12인 이하만 예약할 수 있습니다.');
        if (durationTime.length === 0) return alert('이용 시간은 1일 최대 3시간입니다.');

        const sorted = [...durationTime].sort();
        if (!isConsecutive(sorted)) return alert('이용 시간을 다시 선택하세요.\n(예: 09:00-10:00, 10:00-11:00, 11:00-12:00)');

        const mids = participants.split(',').map(p => p.trim()).filter(p => p);

        const duplicateIds = findDuplicateIds(mids);
        if (duplicateIds.length > 0) {
            return alert(`중복된 참가자 ID가 있습니다:\n${duplicateIds.join(', ')}`);
        }
        
        const result = await validateParticipantIds(mids);
        if (!result.valid) return alert(`존재하지 않는 아이디입니다:\n${result.invalidIds.join(', ')}`);

        const participantCount = mids.filter(p => p).length;
        if (participantCount !== Number(personCount)) return alert('이용인원 수와 참가자 수가 일치하지 않습니다.');

        if (roomName.includes('동아리') && roomName.includes('세미나')) {
            return alert('하루 중 한 시설만 예약할 수 있습니다.')
        };

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
            const msg = err.response?.data?.message || '신청 중 오류가 발생했습니다. 다시 시도해 주세요.';
            alert(msg);
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
                            {timeSlots.map((slot, idx) => {
                                const slotStartStr = slot.split(' - ')[0];
                                const [slotHour, slotMinute] = slotStartStr.split(':').map(Number);

                                const now = new Date();
                                const selected = new Date(selectedDate);
                                const isToday = selected.toDateString() === now.toDateString();

                                const slotStart = new Date(selectedDate);
                                slotStart.setHours(slotHour, slotMinute, 0, 0);

                                const isPast = isToday && slotStart <= now;

                                return (
                                    <label
                                        key={idx}
                                        className={`inline-flex items-center gap-2 border px-2 py-1 rounded cursor-pointer 
                                            ${durationTime.includes(slot)
                                                ? 'bg-green-600 text-white'
                                                : reservedSlots.includes(slot) || isPast
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white'}`}
                                    >
                                        <CheckNonLabel
                                            checked={durationTime.includes(slot)}
                                            onChange={() => toggleDuration(slot)}
                                            inputClassName="w-4 h-4"
                                            disabled={
                                                reservedSlots.includes(slot) ||
                                                (durationTime.length >= 3 && !durationTime.includes(slot)) ||
                                                isPast
                                            }
                                        />
                                        <span>{slot}</span>
                                    </label>
                                );
                            })}
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
                    ※ 예약 확인은{' '}
                    <button
                        onClick={() => navigate('/mylibrary/usedfacility')}
                        className="text-green-700 underline hover:text-green-900 cursor-pointer"
                    >
                        내서재 &gt; 시설이용 신청 내역
                    </button>{' '}
                    에서 확인 가능합니다.
                </p>
            </div>
        </div>
    );
};

export default ApplyFacilityFormComponent;