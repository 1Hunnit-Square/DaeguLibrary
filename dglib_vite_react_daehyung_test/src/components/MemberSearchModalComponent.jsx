import { useState } from "react";
import { searchMemberNumber  } from "../api/memberApi";

const MemberSerachModalComponent = () => {

    const [memberNumber, setMemberNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const handleSearch = (e) => {
        setMemberNumber(e.target.value);
    }
    const ClickSearch = async () => {
        if (!memberNumber) {
            alert("회원번호를 입력해주세요.");
            return;
        }
        if (!/^\d+$/.test(memberNumber)) {
            alert("회원번호가 올바른 형식이 아닙니다.");
            return;
        }
        setIsLoading(true);

        const response = await searchMemberNumber(memberNumber);
        console.log(response.content);
        setSearchResults(response.content);
        setIsLoading(false);
    }
    const memberClick = (e) => {
        if (window.opener) {
            window.opener.postMessage({
                type: 'MEMBER_SELECTED',
                mno: searchResults[e].mno,

            }, '*');
            window.close();
        }


    }

    return (
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">회원 검색</h1>

          <div className="mb-6 flex justify-center">
            <input
              type="number"
              placeholder="회원번호를 입력하세요"
              className="border p-3 rounded-l w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={memberNumber}
              onChange={handleSearch}
              onKeyDown={(e) => {if (e.key === 'Enter' && !isLoading) {e.preventDefault(); ClickSearch();}}}
            />
            <button
              className="px-6 py-3 rounded-r text-white transition bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:bg-blue-300"
              onClick={ClickSearch}
              disabled={isLoading}
            >
              회원번호검색
            </button>
          </div>

          {searchResults && (
            <div className="shadow-md rounded-lg overflow-hidden mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">회원번호</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">이름</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">아이디</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">생년월일</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">성별</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">연락처</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">주소</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">대여수</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">예약수</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">패널티</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {searchResults.map((member, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200"
                      onClick={() => memberClick(index)}
                    >
                      <td className="py-3 px-4">{member.mno}</td>
                      <td className="py-3 px-4 font-medium">{member.name}</td>
                      <td className="py-3 px-4">{member.mid}</td>
                      <td className="py-3 px-4">{member.birthDate}</td>
                      <td className="py-3 px-4">{member.gender}</td>
                      <td className="py-3 px-4">{member.phone}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{member.addr}</td>
                      <td className="py-3 px-4 text-center">{member.rentalCount}</td>
                      <td className="py-3 px-4 text-center">{member.reserveCount}</td>
                      <td className="py-3 px-4 text-center">{member.panalty}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.state === "NORMAL" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                        }`}>
                          {member.state === "NORMAL" ? "정상" : "비정상"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isLoading && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      );
    }

    export default MemberSerachModalComponent;