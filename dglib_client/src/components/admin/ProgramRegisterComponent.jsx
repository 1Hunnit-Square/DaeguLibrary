import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import { checkRoomAvailability, getRoomAvailabilityStatus, registerProgram } from "../../api/programApi";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";

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
        daysOfWeek: [], // 숫자 배열로 관리
        room: "",
        target: "전체",
        capacity: 0,
        teachName: "",
        file: null,
        content: "",
    });

    const dayToNumber = { 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6, 일: 7 };

    const [availableRooms, setAvailableRooms] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomCheckMessage, setRoomCheckMessage] = useState("");
    const [roomCheckType, setRoomCheckType] = useState(""); // success, error

    const mutation = useMutation({
        mutationFn: registerProgram,
        onSuccess: () => {
            alert("등록이 완료되었습니다!");
            navigate("/admin/progmanagement");
        },
        onError: (error) => {
            console.error("등록 오류:", error);
            alert("등록에 실패했습니다: " + (error.response?.data || error.message));
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setForm((prev) => {
            if (name === "daysOfWeek") {
                const dayNumber = dayToNumber[value]; // '월' -> 1 으로 변환
                const currentDays = prev.daysOfWeek;
                if (checked) {
                    // 체크박스 선택 시, 이미 있는 요일은 추가하지 않음
                    return { ...prev, daysOfWeek: [...currentDays, dayNumber].sort((a, b) => a - b) };
                } else {
                    // 체크박스 해제 시, 해당 요일 제거
                    return { ...prev, daysOfWeek: currentDays.filter((day) => day !== dayNumber) };
                }
            } else if (type === "file") {
                return { ...prev, [name]: files[0] };
            } else {
                return { ...prev, [name]: value };
            }
        });
    };

    const handleRoomCheck = async () => {
        const { room, startDate, endDate, daysOfWeek, startTime, endTime } = form;

        if (!room || !startDate || !endDate || daysOfWeek.length === 0) {
            setRoomCheckMessage("강의실, 시작/종료일, 요일을 모두 선택해주세요.");
            setRoomCheckType("error");
            return;
        }

        console.log("포맷된 시간:", {
            startTimeFormatted: dayjs(`2000-01-01T${startTime}`).format("HH:mm"),
            endTimeFormatted: dayjs(`2000-01-01T${endTime}`).format("HH:mm"),
        });

        // 날짜 순서 유효성 검사
        if (dayjs(startDate).isAfter(endDate)) {
            setRoomCheckMessage("시작일은 종료일보다 빠를 수 없습니다.");
            setRoomCheckType("error");
            return;
        }

        const payload = {
            room,
            startDate,
            endDate,
            daysOfWeek,
            startTime: dayjs(`2000-01-01T${startTime}`).format("HH:mm"),
            endTime: dayjs(`2000-01-01T${endTime}`).format("HH:mm"),
        };


        console.log("---강의실 중복 체크 요청 payload---:", payload);

        try {
            const result = await checkRoomAvailability(payload);
            console.log("---checkRoomAvailability result---:", result);

            if (result.full === true) {
                setRoomCheckMessage("해당 강의실은 선택한 날짜/시간에 이미 예약되어 있습니다.");
                setRoomCheckType("error");
            } else {
                setRoomCheckMessage("해당 강의실은 예약 가능합니다.");
                setRoomCheckType("success");
            }
        } catch (error) {
            console.error("강의실 확인 오류:", error);
            setRoomCheckMessage("강의실 확인 중 오류가 발생했습니다.");
            setRoomCheckType("error");
        }
    };

    // 사용 가능한 강의실 목록을 가져오는 함수
    const fetchAvailableRooms = async () => {
        const { startDate, endDate, daysOfWeek, startTime, endTime } = form;
        if (startDate && endDate && daysOfWeek.length > 0 && startTime && endTime) {
            try {
                const payload = {
                    startDate,
                    endDate,
                    daysOfWeek,
                    startTime: dayjs(`2000-01-01T${startTime}`).format("HH:mm"),
                    endTime: dayjs(`2000-01-01T${endTime}`).format("HH:mm"),
                };
                const roomStatusMap = await getRoomAvailabilityStatus(payload);
                setAvailableRooms(roomStatusMap); // roomName: true/false
            } catch (error) {
                console.error("강의실 상태 조회 오류:", error);
                setAvailableRooms({});
            }
        } else {
            setAvailableRooms({});
        }
    };

    useEffect(() => {
        fetchAvailableRooms();
    }, [form.startDate, form.endDate, form.daysOfWeek]); // 날짜/요일 변경 시마다 가용 강의실 업데이트

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();

        formData.append("progName", form.progName);
        formData.append("applyStartAt", form.applyStartAt);
        formData.append("applyEndAt", form.applyEndAt);
        formData.append("startDate", form.startDate);
        formData.append("endDate", form.endDate);
        formData.append("startTime", form.startTime);
        formData.append("endTime", form.endTime);
        formData.append("room", form.room);
        formData.append("target", form.target);
        formData.append("capacity", form.capacity);
        formData.append("teachName", form.teachName);
        formData.append("content", form.content);

        form.daysOfWeek.forEach(day => {
            formData.append("daysOfWeek", day);
        });

        if (form.file) {
            formData.append("file", form.file);
        }

        mutation.mutate(formData);
    };


    // 날짜/시간 포맷팅 유틸 함수 (입력 필드의 value prop에 사용)
    const formatDateTimeLocal = (value) => {
        if (!value) return "";
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format("YYYY-MM-DDTHH:mm") : "";
    };

    // "yyyy-MM-dd" 형식 (date input용)
    const formatDateLocal = (value) => {
        if (!value) return "";
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
    };

    // "HH:mm" 형식 (time input용)
    const formatTimeLocal = (value) => {
        if (!value || typeof value !== "string" || value.length < 4) return "";
        return dayjs(`2000-01-01T${value}`).isValid()
            ? dayjs(`2000-01-01T${value}`).format("HH:mm")
            : "";
    };

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">프로그램 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">프로그램명</label>
                        <input type="text" name="progName" value={form.progName} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">강사명</label>
                        <input type="text" name="teachName" value={form.teachName} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>

                    <div>
                        <label className="block text-gray-700">신청 시작일</label>
                        <input type="datetime-local" name="applyStartAt" value={formatDateTimeLocal(form.applyStartAt)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">신청 종료일</label>
                        <input type="datetime-local" name="applyEndAt" value={formatDateTimeLocal(form.applyEndAt)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>

                    <div>
                        <label className="block text-gray-700">수강 시작일</label>
                        <input type="date" name="startDate" value={formatDateLocal(form.startDate)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">수강 종료일</label>
                        <input type="date" name="endDate" value={formatDateLocal(form.endDate)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>

                    <div>
                        <label className="block text-gray-700">수강 시작 시간</label>
                        <input type="time" name="startTime" value={formatTimeLocal(form.startTime)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">수강 종료 시간</label>
                        <input type="time" name="endTime" value={formatTimeLocal(form.endTime)} onChange={handleChange} className="w-full border p-2 rounded" required />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-700 mb-2">수강 요일</label>
                        <div className="flex gap-2">
                            {Object.keys(dayToNumber).map((dayName) => (
                                <CheckBox
                                    key={dayName}
                                    checked={form.daysOfWeek.includes(dayToNumber[dayName])}
                                    label={dayName}
                                    onChange={(e) => {
                                        const syntheticEvent = {
                                            target: {
                                                name: "daysOfWeek",
                                                value: dayName,
                                                checked: e.target.checked,
                                                type: "checkbox",
                                            },
                                        };
                                        handleChange(syntheticEvent);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-700">강의실</label>
                        <div className="flex items-center gap-2">
                            <select name="room" value={form.room} onChange={handleChange} className="flex-grow border p-2 rounded" required>
                                <option value="">선택</option>
                                {Object.entries(availableRooms).map(([roomName, isAvailable]) => (
                                    <option key={roomName} value={roomName} disabled={!isAvailable}>
                                        {roomName}{!isAvailable ? " (사용불가)" : ""}
                                    </option>
                                ))}
                            </select>
                            <Button type="button" onClick={handleRoomCheck} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                강의실 확인
                            </Button>
                        </div>
                        {roomCheckMessage && (
                            <p className={`mt-2 text-sm ${roomCheckType === "success" ? "text-green-600" : "text-red-600"}`}>
                                {roomCheckMessage}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700">수강대상</label>
                        <select name="target" value={form.target} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="전체">전체</option>
                            <option value="초등학생">초등학생</option>
                            <option value="중학생">중학생</option>
                            <option value="고등학생">고등학생</option>
                            <option value="성인">성인</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">모집인원</label>
                        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full border p-2 rounded" min="1" required />
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <label className="block text-gray-700">첨부 파일</label>
                    <div className="flex items-center gap-3">
                        <input type="file" id="file-upload" name="file" accept=".pdf,.hwp" className="hidden" onChange={handleChange} />
                        <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm">
                            파일 선택
                        </label>
                        <span className="text-sm text-gray-600">
                            {form.file ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{form.file.name}</span>
                                    <button type="button" className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => setForm((prev) => ({ ...prev, file: null }))}>
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-600">선택된 파일 없음</span>
                            )}
                        </span>
                    </div>
                    <textarea name="content" placeholder="내용을 입력하세요" value={form.content} onChange={handleChange} className="w-full border p-2 h-32 rounded" required />
                </div>

                {/* 버튼 */}
                <div className="flex justify-center gap-5 pt-4">
                    <Button type="submit" disabled={isSubmitting || mutation.isLoading}>
                        {isSubmitting || mutation.isLoading ? "등록 중..." : "등록하기"}
                    </Button>
                    <Button type="button" onClick={() => navigate(-1)} className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer">
                        취소
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProgramRegisterComponent;