import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProgramDetail, applyProgram, checkAlreadyApplied } from "../../api/programApi";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import Button from "../common/Button";
import Loading from '../../routers/Loading';
import Download from "../common/Download";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

const ProgramDetailComponent = () => {
    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();
    const { moveToLogin } = useMoveTo();
    const { progNo } = useParams();
    const [program, setProgram] = useState(null);
    const [isApplied, setIsApplied] = useState(false);

    useEffect(() => {
        getProgramDetail(progNo).then(data => {
            setProgram(data);
        });

        if (mid) {
            checkAlreadyApplied(progNo, mid).then(setIsApplied).catch(() => { });
        }
    }, [progNo]);

    const isBeforeStart = program?.applyStartAt
        ? dayjs().isBefore(dayjs(program.applyStartAt))
        : false;

    const isExpired = program?.applyEndAt
        ? dayjs().isAfter(dayjs(program.applyEndAt))
        : false;

    const isFull = program?.current >= program?.capacity;

    const isDisabled = program?.status === "신청전" || isBeforeStart || isExpired || isFull;

    const handleApply = async () => {
        if (isBeforeStart) {
            alert("신청 시작 전입니다.");
            return;
        }

        if (isExpired) {
            alert("신청 기간이 종료되었습니다.");
            return;
        }

        if (isFull) {
            alert("모집 인원이 마감되었습니다.");
            return;
        }

        if (!mid) {
            moveToLogin("로그인 후 이용해주세요.");
            return;
        }

        if (isApplied) {
            alert("이미 신청하신 프로그램입니다.");
            return;
        }

        try {
            await applyProgram(program.progNo, mid);
            alert("신청이 완료되었습니다!");
            navigate("/myLibrary/useprogram?from=program");
        } catch (e) {
            alert(e.response?.data?.message || "신청 중 오류 발생");
        }
    };

    if (!program) return <Loading />;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
            <table className="w-full border-t border-gray-200 text-sm">
                <thead>
                    <tr>
                        <th colSpan={2} className="text-center text-lg font-semibold px-6 py-4 bg-gray-100 border-b">
                            {program.progName}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t border-gray-200">
                        <td className="w-32 pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">강좌기간</td>
                        <td className="pl-4 py-2 text-left">
                            {dayjs(program.startDate).format("YYYY-MM-DD")} ({dayjs(program.startDate).format("dd")}) ~
                            {dayjs(program.endDate).format("YYYY-MM-DD")} ({dayjs(program.endDate).format("dd")})
                        </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">강좌시간</td>
                        <td className="pl-4 py-2 text-left">
                            {dayjs(`2000-01-01T${program.startTime}`).format("HH:mm")} ~ {dayjs(`2000-01-01T${program.endTime}`).format("HH:mm")}
                        </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">신청기간</td>
                        <td className="pl-4 py-2 text-left">
                            {dayjs(program.applyStartAt).format('YYYY-MM-DD HH:mm')} ~ {dayjs(program.applyEndAt).format('YYYY-MM-DD HH:mm')}
                        </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">신청방법</td>
                        <td className="pl-4 py-2 text-left">인터넷접수</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">수강대상</td>
                        <td className="pl-4 py-2 text-left">{program.target}</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">모집인원</td>
                        <td className="pl-4 py-2 text-left">{program.current} / {program.capacity}명 (선착순)</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">강의실</td>
                        <td className="pl-4 py-2 text-left">{program.room}</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">참가비</td>
                        <td className="pl-4 py-2 text-left">{program.price || '무료'}</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">강사</td>
                        <td className="pl-4 py-2 text-left">{program.teachName}</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">첨부파일</td>
                        <td className="pl-4 py-2 text-left">
                            {program.originalName ? (
                                <Download
                                    link={`/api/programs/file/${program.progNo}`}
                                    fileName={program.originalName}
                                    className="text-gray-600 hover:underline"
                                />
                            ) : (
                                '없음'
                            )}
                        </td>
                    </tr>
                    <tr className="border-t border-b border-gray-200">
                        <td className="pr-2 py-2 font-bold border-r border-gray-300 text-center align-top">내용</td>
                        <td className="pl-4 py-2 text-left whitespace-pre-line">{program.content}</td>
                    </tr>
                </tbody>
            </table>

            <div className="flex justify-center mt-8 space-x-4">
                <Button
                    onClick={() => window.history.back()}
                    className="bg-gray-400 text-black hover:bg-gray-500 cursor-pointer"
                >
                    돌아가기
                </Button>

                <Button
                    onClick={handleApply}
                    disabled={isDisabled}
                    className={`
                        ${isExpired || isFull
                            ? "bg-slate-600 hover:bg-slate-600 hover:cursor-not-allowed"
                            : isBeforeStart
                                ? "bg-blue-500 hover:bg-blue-500 hover:cursor-not-allowed"
                                : "bg-green-700 hover:bg-green-800"
                        }
                         text-white px-4 py-2 rounded
                        `}
                >
                    {isApplied
                        ? "신청완료"
                        : isBeforeStart
                            ? "신청전"
                            : isExpired
                                ? "신청마감"
                                : isFull
                                    ? "모집마감"
                                    : "신청하기"}
                </Button>
            </div>
        </div>
    );
};

export default ProgramDetailComponent;
