import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { checkRoomAvailability, getAvailableRooms } from "../../api/programApi";

const ProgramRegisterComponent = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        progName: "",
        applyStartAt: "",
        applyEndAt: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        daysOfWeek: [],
        room: "",
        target: "전체",
        capacity: 0,
        teachName: "",
        file: null,
        content: "",
    });

    const [availableRooms, setAvailableRooms] = useState([
        "문화교실1", "문화교실2", "문화교실3"
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAvailableRooms = async () => {
        try {
            const res = await getAvailableRooms({
                startDate: form.startDate,
                endDate: form.endDate,
                daysOfWeek: form.daysOfWeek,
            });
            setAvailableRooms(res);
        } catch (err) {
            console.error("강의실 목록 조회 실패", err);
            setAvailableRooms(["문화교실1", "문화교실2", "문화교실3"]);
        }
    };

    useEffect(() => {
        if (!form.startDate || !form.endDate || form.daysOfWeek.length === 0) {
            setAvailableRooms(["문화교실1", "문화교실2", "문화교실3"]);
            return;
        }
        fetchAvailableRooms();
    }, [form.startDate, form.endDate, form.daysOfWeek]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                daysOfWeek: checked
                    ? [...prev.daysOfWeek, value]
                    : prev.daysOfWeek.filter((v) => v !== value),
            }));
        } else if (type === "file") {
            setForm((prev) => ({ ...prev, file: files[0] }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await checkRoomAvailability({
                startDate: form.startDate,
                endDate: form.endDate,
                daysOfWeek: form.daysOfWeek,
            });
            if (res.full) {
                alert("모든 강의실이 예약되어 있어 등록할 수 없습니다.");
                return;
            }
        } catch (err) {
            console.error("장소 중복 확인 실패", err);
            alert("장소 확인 중 오류 발생");
            return;
        } finally {
            setIsSubmitting(false);
        }

        alert("등록 완료!");
        console.log(form);
        navigate("/admin/progmanagement");
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-green-700">📋 프로그램 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 기본 정보 */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">기본 정보</h3>
                    <input type="text" name="progName" placeholder="프로그램명" className="w-full border p-2 rounded" onChange={handleChange} required />
                    <input type="text" name="teachName" placeholder="강사명" className="w-full border p-2 rounded" onChange={handleChange} required />
                    <select name="room" className="w-full border p-2 rounded" onChange={handleChange} required>
                        <option value="">장소 선택</option>
                        {availableRooms.map((room) => (
                            <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                    <select name="target" className="w-full border p-2 rounded" onChange={handleChange}>
                        <option value="전체">전체</option>
                        <option value="청소년">청소년</option>
                        <option value="성인">성인</option>
                    </select>
                    <input type="number" name="capacity" placeholder="정원 (숫자)" min="1" className="w-full border p-2 rounded" onChange={handleChange} required />
                </div>

                {/* 일정 */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">신청 및 운영 일정</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" name="applyStartAt" className="border p-2 rounded" onChange={handleChange} required />
                        <input type="date" name="applyEndAt" className="border p-2 rounded" onChange={handleChange} required />
                        <input type="date" name="startDate" className="border p-2 rounded" onChange={handleChange} required />
                        <input type="date" name="endDate" className="border p-2 rounded" onChange={handleChange} required />
                        <input type="time" name="startTime" className="border p-2 rounded" onChange={handleChange} required />
                        <input type="time" name="endTime" className="border p-2 rounded" onChange={handleChange} required />
                    </div>
                </div>

                {/* 요일 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">수강 요일</h3>
                    <div className="flex flex-wrap gap-3">
                        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                            <CheckBox
                                key={day}
                                label={day}
                                checked={form.daysOfWeek.includes(day)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    const updated = checked
                                        ? [...form.daysOfWeek, day]
                                        : form.daysOfWeek.filter((d) => d !== day);

                                    // 요일 순서대로 정렬
                                    const dayOrder = ["월", "화", "수", "목", "금", "토", "일"];
                                    updated.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

                                    setForm((prev) => ({ ...prev, daysOfWeek: updated }));
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* 파일 및 설명 */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">첨부파일 및 설명</h3>
                    <div className="flex items-center gap-4">
                        <input type="file" id="file-upload" name="file" className="hidden" onChange={handleChange} />
                        <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm">
                            파일 선택
                        </label>
                        <span className="text-sm text-gray-600">
                            {form.file ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{form.file.name}</span>
                                    <button
                                        type="button"
                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                        onClick={() => setForm((prev) => ({ ...prev, file: null }))}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-600">선택된 파일 없음</span>
                            )}
                        </span>
                    </div>
                    <textarea name="content" placeholder="내용을 입력하세요" className="w-full border p-2 h-32 rounded" onChange={handleChange} />
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "등록 중..." : "등록하기"}
                    </Button>
                    <Button type="button" onClick={() => navigate(-1)} className="bg-gray-400 hover:bg-gray-500">취소</Button>
                </div>
            </form>
        </div>
    );
};

export default ProgramRegisterComponent;