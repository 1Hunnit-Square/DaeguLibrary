import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProgramDetail, applyProgram } from "../../api/programApi";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import Button from "../common/Button";
import Loading from '../../routers/Loading';
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

const ProgramDetailComponent = () => {
    const mid = useRecoilValue(memberIdSelector);
    const navigate = useNavigate();
    const { moveToLogin } = useMoveTo();
    const { progNo } = useParams();
    const [program, setProgram] = useState(null);

    useEffect(() => {
        getProgramDetail(progNo).then(data => {
            setProgram(data);
        });
    }, [progNo]);

    // program이 로드된 이후에만 계산하도록 방어 코드
    const isExpired = program?.applyEndAt
        ? dayjs(program.applyEndAt).isBefore(dayjs())
        : false;

    const handleApply = async () => {
        if (program.status === "신청전") {
            alert("신청 기간이 아닙니다.");
            return;
        }

        if (isExpired) {
            alert("신청 기간이 종료되었습니다.");
            return;
        }

        if (!mid) {
            moveToLogin("로그인 후 이용해주세요.");
            return;
        }

        try {
            await applyProgram(program.progNo, mid);
            alert("신청이 완료되었습니다!");
            // navigate("/my/applyList"); // 필요 시 이동
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
                                <a
                                    href={`/api/programs/file/${program.progNo}`}
                                    className="text-blue-600 underline"
                                    download
                                >
                                    {program.originalName}
                                </a>
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
                    className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
                >
                    돌아가기
                </Button>

                <Button
                    onClick={handleApply}
                    className={`${program.status === "신청전" || isExpired
                        ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                        : "bg-[#00893B] hover:bg-[#006C2D]"
                        } text-white px-4 py-2 rounded`}
                >
                    {program.status === "신청전"
                        ? "신청 불가"
                        : isExpired
                            ? "신청 마감"
                            : "신청하기"}
                </Button>
            </div>
        </div>
    )
};

export default ProgramDetailComponent;
