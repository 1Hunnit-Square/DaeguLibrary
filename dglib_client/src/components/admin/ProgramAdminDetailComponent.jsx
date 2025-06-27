import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getProgramDetail, getApplicantsByProgram, deleteProgram, cancelProgram } from "../../api/programApi";
import Button from "../common/Button";
import Download from "../common/Download";
import dayjs from "dayjs";
import { usePagination } from "../../hooks/usePage";
import Loading from "../../routers/Loading";

const ProgramAdminDetailComponent = () => {
  const { progNo } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [program, setProgram] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const numberToDay = {
    1: "월요일",
    2: "화요일",
    3: "수요일",
    4: "목요일",
    5: "금요일",
    6: "토요일",
    7: "일요일",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programRes, applicantsRes] = await Promise.all([
          getProgramDetail(progNo),
          getApplicantsByProgram(progNo),
        ]);
        setProgram(programRes);
        setApplicants(applicantsRes);
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [progNo]);

  const handleDelete = async () => {
    if (window.confirm("정말 이 프로그램을 삭제하시겠습니까?")) {
      try {
        await deleteProgram(progNo);
        alert("삭제되었습니다");
        navigate("/admin/progmanagement");
      } catch (err) {
        alert("삭제 중 오류 발생");
        console.error(err);
      }
    }
  };

  // 신청 회원 취소
  const handleCancel = async (progUseNo) => {
    if (window.confirm("이 신청을 취소하시겠습니까?")) {
      try {
        await cancelProgram(progUseNo);
        alert("취소되었습니다.");
        setApplicants((prev) => prev.filter((a) => a.progUseNo !== progUseNo));
      } catch (err) {
        console.error(err);
        alert("취소 중 오류 발생");
      }
    }
  };

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 10;
  const totalPages = Math.ceil(applicants.length / pageSize);
  const paginatedData = applicants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const { renderPagination } = usePagination(
    {
      content: applicants,
      totalPages,
      pageable: { pageNumber: currentPage - 1 },
    },
    searchParams,
    setSearchParams,
    isLoading
  );

  if (isLoading || !program) return <Loading text="불러오는 중..." />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 상단 버튼 */}
      <div className="flex gap-4 justify-end text-sm mt-4">
        <Button onClick={() => navigate(`/admin/progmanagement/programregister/${progNo}`)}>
          수정
        </Button>
        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
          삭제
        </Button>
      </div>

      {/* 프로그램 상세 정보 */}
      <div className="flex justify-center font-bold mb-6">
        <p className="text-xl text-green-800">{program.progName}</p>
      </div>

      <div className="bg-white p-6 rounded-xl drop-shadow-sm space-y-3 mb-15">
        {[
          ["운영기간", `${program.startDate} ~ ${program.endDate}`],
          ["운영시간", `${program.startTime} ~ ${program.endTime}`],
          [
            "수강요일",
            Array.isArray(program.daysOfWeek) && program.daysOfWeek.length > 0
              ? program.daysOfWeek.map((num) => numberToDay[num]).join(", ")
              : "없음",
          ],
          ["신청기간", `${program.applyStartAt} ~ ${program.applyEndAt}`],
          ["수강대상", program.target],
          ["모집인원", `${program.current || 0} / ${program.capacity}`],
          ["장소", program.room],
          ["강사", program.teachName],
        ].map(([label, value]) => (
          <div key={label} className="flex">
            <strong className="w-28 text-gray-800">{label}:</strong>
            <span>{value}</span>
          </div>
        ))}
        <div className="flex">
          <strong className="w-28 text-gray-800">첨부파일:</strong>
          {program.filePath ? (
            <Download
              link={`/api/programs/file/${program.progNo}`}
              fileName={program.originalName || "파일 다운로드"}
              className="text-gray-600 hover:underline"
            />
          ) : (
            <span>첨부파일 없음</span>
          )}
        </div>
      </div>

      {/* 신청자 목록 */}
      <div className="bg-white p-6 rounded-xl drop-shadow-sm">
        <h3 className="text-xl font-semibold mb-4">신청 회원</h3>
        {Array.isArray(applicants) && applicants.length > 0 ? (
          <>
            <table className="w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">번호</th>
                  <th className="p-2">회원ID</th>
                  <th className="p-2">이름</th>
                  <th className="p-2">이메일</th>
                  <th className="p-2">연락처</th>
                  <th className="p-2">신청일</th>
                  <th className="p-2">신청 취소</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((a, i) => (
                  <tr key={a.progUseNo} className="border border-gray-300 text-center">
                    <td className="p-2">
                      {(currentPage - 1) * pageSize + i + 1}
                    </td>
                    <td className="p-2">{a.mid}</td>
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.email}</td>
                    <td className="p-2">{a.phone}</td>
                    <td className="p-2">
                      {a.applyAt
                        ? dayjs(a.applyAt).format("YYYY-MM-DD HH:mm")
                        : "-"}
                    </td>
                    <td className="p-2">
                      {a.status === "신청완료" ? (
                        <Button
                          onClick={() => handleCancel(a.progUseNo)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          취소
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-xs">취소 불가</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6">{renderPagination()}</div>
          </>
        ) : (
          <p>신청한 회원이 없습니다.</p>
        )}
      </div>

      {/* 이전 페이지로 돌아가기 */}
      <div className="flex justify-center mt-12">
        <Button 
          onClick={() => navigate(-1)}
          className="bg-gray-400 hover:bg-gray-500 text-sm font-bold"
          >
          목록
        </Button>
      </div>
    </div>
  );
};

export default ProgramAdminDetailComponent;