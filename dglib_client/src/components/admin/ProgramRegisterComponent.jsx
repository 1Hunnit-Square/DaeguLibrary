import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../common/Button";
import CheckBox from "../common/CheckBox";
import dayjs from "dayjs";
import { getProgramDetail, registerProgram, updateProgram, checkRoomAvailability, getRoomAvailabilityStatus } from "../../api/programApi";

const ProgramRegisterComponent = () => {
    const navigate = useNavigate();
    const { progNo } = useParams();
    const isEdit = !!progNo;

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
    const [roomCheckMessage, setRoomCheckMessage] = useState("");
    const [roomCheckType, setRoomCheckType] = useState("");

    const { data: programDetail } = useQuery({
        queryKey: ["programDetail", progNo],
        queryFn: () => getProgramDetail(progNo),
        enabled: isEdit,
    });

    useEffect(() => {
        if (programDetail && isEdit) {
            setForm((prev) => ({
                ...prev,
                ...programDetail,
                file: null,
                daysOfWeek: programDetail.daysOfWeek || [],
            }));
        }
    }, [programDetail, isEdit]);

    const registerMutation = useMutation({
        mutationFn: registerProgram,
        onSuccess: () => {
            alert("등록이 완료되었습니다!");
            navigate("/admin/progmanagement");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (formData) => updateProgram(progNo, formData),
        onSuccess: () => {
            alert("수정이 완료되었습니다!");
            navigate("/admin/progmanagement");
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setForm((prev) => {
            if (name === "daysOfWeek") {
                const dayNumber = dayToNumber[value];
                const currentDays = prev.daysOfWeek;
                return {
                    ...prev,
                    daysOfWeek: checked
                        ? [...currentDays, dayNumber].sort((a, b) => a - b)
                        : currentDays.filter((d) => d !== dayNumber),
                };
            } else if (type === "file") {
                return { ...prev, file: files[0] };
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
        const payload = {
            room,
            startDate,
            endDate,
            daysOfWeek,
            startTime: dayjs(`2000-01-01T${startTime}`).format("HH:mm"),
            endTime: dayjs(`2000-01-01T${endTime}`).format("HH:mm"),
        };
        try {
            const result = await checkRoomAvailability(payload);
            await fetchAvailableRooms();
            if (result.full === true) {
                setRoomCheckMessage("해당 강의실은 이미 예약되어 있습니다.");
                setRoomCheckType("error");
            } else {
                setRoomCheckMessage("예약 가능합니다.");
                setRoomCheckType("success");
            }
        } catch {
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
                setAvailableRooms(roomStatusMap);
            } catch {
                setAvailableRooms({});
            }
        }
    };

    useEffect(() => {
        fetchAvailableRooms();
    }, [form.startDate, form.endDate, form.daysOfWeek, form.startTime, form.endTime]); // 날짜/요일 변경 시마다 가용 강의실 업데이트

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedForm = {
            ...form,
            applyStartAt: dayjs(form.applyStartAt).format("YYYY-MM-DDTHH:mm"),
            applyEndAt: dayjs(form.applyEndAt).format("YYYY-MM-DDTHH:mm"),
            // createdAt: dayjs(form.createdAt).format("YYYY-MM-DDTHH:mm"),
            startDate: dayjs(form.startDate).format("YYYY-MM-DD"),
            endDate: dayjs(form.endDate).format("YYYY-MM-DD"),
            startTime: dayjs(`2000-01-01T${form.startTime}`).format("HH:mm"),
            endTime: dayjs(`2000-01-01T${form.endTime}`).format("HH:mm"),
        };

        const formData = new FormData();

        Object.entries(formattedForm).forEach(([key, value]) => {
            if (key === "daysOfWeek") {
                value.forEach((day) => formData.append("daysOfWeek", day));
            } else if (key === "file" && form.file) {
                formData.append("file", form.file);
            } else if (key !== "createdAt") {
                formData.append(key, value);
            }
        });


        isEdit ? updateMutation.mutate(formData) : registerMutation.mutate(formData);
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
            <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? "프로그램 수정" : "프로그램 등록"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-800">프로그램명</label>
                        <input type="text" name="progName" value={form.progName} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">강사명</label>
                        <input type="text" name="teachName" value={form.teachName} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">신청 시작일</label>
                        <input type="datetime-local" name="applyStartAt" value={formatDateTimeLocal(form.applyStartAt)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">신청 종료일</label>
                        <input type="datetime-local" name="applyEndAt" value={formatDateTimeLocal(form.applyEndAt)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>

                    <div>
                        <label className="block text-gray-800">수강 시작일</label>
                        <input type="date" name="startDate" value={formatDateLocal(form.startDate)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">수강 종료일</label>
                        <input type="date" name="endDate" value={formatDateLocal(form.endDate)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">수강 시작 시간</label>
                        <input type="time" name="startTime" value={formatTimeLocal(form.startTime)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-800">수강 종료 시간</label>
                        <input type="time" name="endTime" value={formatTimeLocal(form.endTime)} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" required />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-800 mb-2">수강 요일</label>
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
                        <label className="block text-gray-800">강의실</label>
                        <div className="flex items-center gap-2">
                            <select name="room" value={form.room} onChange={handleChange} className="flex-grow border border-gray-500 p-2 rounded" required>
                                <option value="">선택</option>
                                {Object.entries(availableRooms).map(([roomName, isAvailable]) => (
                                    <option key={roomName} value={roomName} disabled={!isAvailable}>
                                        {roomName}{!isAvailable ? " (사용불가)" : ""}
                                    </option>
                                ))}
                            </select>
                            {/* 
                            ⚠️ 공통 Button 컴포넌트를 사용하지 않은 이유
                            - 이 버튼은 'form submit'을 트리거하지 않아야 하므로, type="button"이 반드시 명시되어야 함
                            - 현재 Button 컴포넌트는 내부적으로 type이 지정되어 있지 않아서 기본적으로 type="submit"으로 동작할 수 있음
                            - 실수로 프로그램 수정 API가 호출되는 문제를 방지하기 위해 native <button> 사용
                            */}
                            <button
                                type="button"
                                onClick={handleRoomCheck}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-3 rounded text-sm cursor-pointer"
                            >
                                강의실 확인
                            </button>
                        </div>
                        {roomCheckMessage && (
                            <p className={`mt-2 text-sm ${roomCheckType === "success" ? "text-green-600" : "text-red-600"}`}>
                                {roomCheckMessage}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-800">수강대상</label>
                        <select
                            name="target"
                            value={form.target}
                            onChange={handleChange}
                            className="w-full border border-gray-500 p-2 rounded"
                        >
                            <option value="전체">전체</option>
                            <option value="어린이">어린이</option>
                            <option value="청소년">청소년</option>
                            <option value="성인">성인</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-800">모집인원</label>
                        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full border border-gray-500 p-2 rounded" min="1" required />
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <label className="block text-gray-800">첨부 파일</label>
                    <div className="flex items-center gap-3">
                        <input type="file" id="file-upload" name="file" accept=".pdf,.hwp" className="hidden" onChange={handleChange} />
                        <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm">
                            파일 선택
                        </label>
                        <span className="text-sm text-gray-800">
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
                    <textarea name="content" placeholder="내용을 입력하세요" value={form.content} onChange={handleChange} className="w-full border border-gray-500 p-2 h-32 rounded" required />
                </div>

                {/* 버튼 */}
                <div className="flex justify-center gap-5 pt-4">
                    <Button
                        type="submit"
                        disabled={registerMutation.isLoading || updateMutation.isLoading}
                    >
                        {(registerMutation.isLoading || updateMutation.isLoading)
                            ? "처리 중..."
                            : (isEdit ? "수정하기" : "등록하기")}
                    </Button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-400 text-white hover:bg-gray-500 px-4 py-2 rounded cursor-pointer"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProgramRegisterComponent;