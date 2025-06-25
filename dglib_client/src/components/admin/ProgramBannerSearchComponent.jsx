import { useState, useEffect } from "react";
import { getAllPrograms } from "../../api/programApi";
import Button from "../common/Button";

const ProgramBannerSearchComponent = ({ onSelect, onClose }) => {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await getAllPrograms();
      setPrograms(res);
    } catch (err) {
      console.error("프로그램 목록 불러오기 실패", err);
    }
  };

  const filtered = programs.filter(p =>
    p.progName.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="bg-white w-full max-w-3xl p-6 rounded shadow-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-green-800">프로그램 검색</h2>
          <button onClick={onClose} className="text-gray-600 font-semibold hover:text-black cursor-pointer">✕</button>
        </div>

        <input
          type="text"
          placeholder="프로그램명 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 shadow px-3 py-2 rounded-xl mb-4"
        />

        <div className="max-h-70 overflow-y-auto space-y-2">
          {filtered.map(program => (
            <div
              key={program.progNo}
              className="border border-gray-300 rounded-xl shadow p-3 hover:bg-yellow-50 cursor-pointer"
              onClick={() => onSelect(program)}
            >
              <p className="font-semibold">{program.progName}</p>
              <p className="text-sm">강사: {program.teachName}</p>
              <p className="text-sm text-gray-700">
                강의 기간: {program.startDate} - {program.endDate}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
  );
};

export default ProgramBannerSearchComponent;