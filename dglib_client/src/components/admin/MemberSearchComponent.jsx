import { useState } from "react";
import { searchMemberNumber  } from "../../api/adminApi";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from "../common/Button";
import Loading from "../../routers/Loading";
import Modal from "../common/Modal";
import QRScanComponent from "./QRScanComponent";

const MemberSearchComponent = () => {

    const [memberNumber, setMemberNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [ isOpen, setIsOpen ] = useState(false);
    const handleSearch = (e) => {
        setMemberNumber(e.target.value);
    }

    const searchMutation = useMutation({
        mutationFn: async (memberNumber) => {
            return await searchMemberNumber(memberNumber);
        },
        onSuccess: (response) => {
            console.log(response.content);
            setSearchResults(response.content);
        },
        onError: (error) => {
            console.log("회원 검색 오류:", error);
            alert("회원 검색에 실패했습니다. " + error.response?.data?.message);
        }
    });

    const ClickSearch = () => {
        if (!memberNumber) {
            alert("회원번호를 입력해주세요.");
            return;
        }
        if (!/^\d+$/.test(memberNumber)) {
            alert("회원번호가 올바른 형식이 아닙니다.");
            return;
        }
        searchMutation.mutate(memberNumber);
    }

    const memberClick = (e) => {
      if (searchResults[e].state === "LEAVE") {
            alert("탈퇴한 회원입니다.");
            return;
      }
      if (searchResults[e].state === "PUNISH") {
            alert("정지 상태인 회원입니다.");
            return;
      }
      if (searchResults[e].state === "OVERDUE") {
            alert("제재 상태인 회원입니다.");
            return;
      }
      if (searchResults[e].rentalCount + searchResults[e].reserveCount >= 5) {
            alert("대출 및 예약 한도가 초과되었습니다.");
            return;
      }

        if (window.opener) {
            window.opener.postMessage({
                type: 'MEMBER_SELECTED',
                mno: searchResults[e].mno,

            }, '*');
            window.close();
        }


    }

    const handleScanner = (result) => {
      if(result.expired){
        alert("회원증 유효시간이 만료되었습니다.");
        return;
      }

      searchMutation.mutate(result.mno);
      setIsOpen(false);

    }

    return (
        <div className="max-w-7xl mx-auto p-8">
          {searchMutation.isPending && (
                    <Loading text={ "회원 검색중입니다.."} />
                  )}
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">회원 검색</h2>
            <div className="flex items-center mx-auto justify-center w-120 gap-3 mb-6">
              <input
                  type="text"
                  placeholder="회원번호를 입력하세요"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                  value={memberNumber}
                  onChange={handleSearch}
                  onKeyDown={(e) => {if (e.key === 'Enter' && !isLoading) {e.preventDefault(); ClickSearch();}}}
              />
              <Button
                  onClick={!searchMutation.isPending ? ClickSearch : undefined}
                  disabled={searchMutation.isPending}
                  children="검색"
              />
              <Button
                  onClick={()=>setIsOpen(true)}
                  children="스캔"
                  className="bg-blue-500 hover:bg-blue-600"
              />
          </div>

          {searchResults && (
            <div className="shadow-md rounded-lg overflow-hidden mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-[#00893B] text-white">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">회원번호</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">이름</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">아이디</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">생년월일</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">성별</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">연락처</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">주소</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">대여수</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">예약수</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">무인예약수</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">패널티</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {searchResults.map((member, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200"
                      onClick={() => memberClick(index)}
                    >
                      <td className="py-3 px-4 text-xs">{member.mno}</td>
                      <td className="py-3 px-4 text-xs font-medium">{member.name}</td>
                      <td className="py-3 px-4 text-xs">{member.mid}</td>
                      <td className="py-3 px-4 text-xs">{member.birthDate}</td>
                      <td className="py-3 px-4 text-xs">{member.gender}</td>
                      <td className="py-3 px-4 text-xs">{member.phone}</td>
                      <td className="py-3 px-4 text-xs max-w-[150px] truncate">{member.addr}</td>
                      <td className="py-3 px-4 text-xs text-center">{member.rentalCount}</td>
                      <td className="py-3 px-4 text-xs text-center">{member.reserveCount}</td>
                      <td className="py-3 px-4 text-xs text-center">{member.unmannedCount}</td>
                      <td className="py-3 px-4 text-xs text-center">{member.panaltyDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.state === "NORMAL" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                        }`}>
                          {member.state === "NORMAL" ? "정상" : member.state === "OVERDUE" ? "제재" : member.state === "PUNISH" ? "정지" : "탈퇴"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Modal isOpen={isOpen} title="회원증 조회" onClose={()=>setIsOpen(false)} dragOn={false} >{<QRScanComponent handleScanner={handleScanner} />}</Modal>
        </div>
      );
    }

    export default MemberSearchComponent;