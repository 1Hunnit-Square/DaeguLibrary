import { useState, useEffect, useMemo } from "react";
import { getMemberPhone, regWishBook } from "../../api/memberApi";
import Button from "../common/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { memberNameSelector } from '../../atoms/loginState';
import { useRecoilValue } from "recoil";
import Loading from "../../routers/Loading";
import { useNavigate } from "react-router-dom";


const initialBookFormData = {
  bookTitle: "",
  author: "",
  publisher: "",
  isbn: "",
  note: "",
};

const BookRequestFormComponent = () => {
  const [bookFormData, setBookFormData] = useState(initialBookFormData);
  const name = useRecoilValue(memberNameSelector);
  const today = new Date().toLocaleDateString('en-CA');
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { data: memberData=[], isLoading, isError } = useQuery({
    queryKey: ["memberData"],
    queryFn: getMemberPhone,
  });


  const regWishBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const response = await regWishBook(bookData);
      return response;
    },
    onSuccess: () => {
      alert("도서 등록이 완료되었습니다.");
      navigate(`/mylibrary/request?year=${year}`);



    },
    onError: (error) => {
      alert(error.response.data.message);
    },
  });

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "BOOK_SELECTED") {
        setBookFormData({
          bookTitle: event.data.book.bookTitle,
          author: event.data.book.author,
          publisher: event.data.book.publisher,
          isbn: event.data.book.isbn,
          note: "",
        });

      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);



  const sumbit = async () => {
    const isBookDataValid = bookFormData.bookTitle || (bookFormData.note && bookFormData.note.trim() !== "");
    if (!isBookDataValid) {
      alert("희망도서명이나 비고를 작성해주세요.");
      return;
    }
    regWishBookMutation.mutate(bookFormData);
  };



  const searchClick = () => {
    const windowName = "등록도서 검색"
    window.open(`/searchbookapi`, windowName, "_blank", "width=1200,height=800");
  };




  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow-md">
      {regWishBookMutation.isPending && (
        <Loading text="도서 등록중입니다.." />
      )}
      {isLoading && (
        <Loading text="신청자 정보를 불러오는 중입니다.." />
      )}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-6">
        <h2 className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-base">신청자 기본정보</h2>
        <div className="p-5 space-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 flex-shrink-0">성명</label>
            <input type="text" value={name} readOnly className="p-2 border border-gray-300 rounded-md w-full sm:w-60 bg-gray-100 text-sm focus:outline-none" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 flex-shrink-0">휴대폰 번호</label>
            <div className="flex items-center space-x-2">
              <input type="text" value={memberData?.phoneList?.[0] || ""} readOnly className="p-2 border border-gray-300 rounded-md w-20 bg-gray-100 text-sm focus:outline-none" />
              <span className="text-gray-400">-</span>
              <input type="text" value={memberData?.phoneList?.[1] || ""} readOnly className="p-2 border border-gray-300 rounded-md w-24 bg-gray-100 text-sm focus:outline-none" />
              <span className="text-gray-400">-</span>
              <input type="text" value={memberData?.phoneList?.[2] || ""} readOnly className="p-2 border border-gray-300 rounded-md w-24 bg-gray-100 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
       <p className="text-xs mt-1.5 mb-1.5 text-right"><span className="text-red-500">✓</span> 표시가 된 곳은 필수 항목입니다.</p>
      <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-6">
        <h2 className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-base">희망도서 신청</h2>
        <div className="p-5 space-y-1">
          <div className="flex flex-col sm:flex-row items-start py-2.5 border-b border-gray-100">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">
              <span className="text-red-500 mr-1">✓</span>희망도서명
            </label>
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
                <input
                  type="text"
                  value={bookFormData.bookTitle}
                  readOnly
                  placeholder="도서검색 버튼으로 선택하세요"
                  className="p-2 border border-gray-300 rounded-md flex-grow max-w-xl bg-gray-100 text-sm focus:outline-none"
                />
                <Button onClick={searchClick} className=" rounded-md whitespace-nowrap" children="도서검색" />
              </div>

            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-0 sm:pt-1.5 flex-shrink-0">
                <span className="text-red-500 mr-1">✓</span>이용일자
            </label>
            <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700">{today}</div>
          </div>
          <div className="flex flex-col sm:flex-row items-start py-2.5 border-b border-gray-100">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-0 sm:pt-1 flex-shrink-0">SMS 발송</label>
            <div className="text-xs text-gray-500 space-y-5 mt-1 sm:mt-0">
              <p>※ SMS 발송 거부하신 경우 희망도서 비치 완료 안내 문자를 수신할 수 없습니다.</p>
              <p>변경을 원하시면 마이페이지에서 수정할 수 있습니다.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start py-2.5 border-b border-gray-100">
            <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-0 sm:pt-1 flex-shrink-0">선정 제외 도서</label>
            <div className="text-xs text-gray-500 space-y-5 mt-1 sm:mt-0">
              <p>- 출판된 지 5년 이상된 자료(컴퓨터 과학 신학문 분야는 2년)</p>
              <p>- 고가도서(5만원이상), 3권을 초과하는 시리즈 또는 전집류</p>
              <p>- 개인용 학습서(전공서, 문제집, 수험서, 참고서, 연습교재 등)</p>
              <p>- 작품성이 낮은 판타지, 로맨스, 선정적인 자료, 무협지, 만화류</p>
              <p>- 특정 분야의 전문적인 자료, 대학교재</p>
              <p>- 그 외 도서관 자료로 부적합한 도서</p>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-6">
        <h2 className="px-5 py-3 border-b border-gray-200 font-semibold text-gray-700 text-base">비고</h2>
        <div className="p-5">
          <textarea
            value={bookFormData.note}
            onChange={(e) => setBookFormData({...bookFormData, note: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00893B]"
            rows="4"
            placeholder=""
          />

          <p className="text-xs text-gray-500 mt-2">ⓘ 희망도서는 1~2개월 이상의 기간이 소요될 수 있습니다.</p>
        </div>
      </div>

      <div className="flex justify-center space-x-3 mt-8">
        <Button onClick={sumbit} className="bg-[#00893B] hover:bg-[#00722f] text-white px-7 py-2.5 text-sm rounded-md" children="신청하기" />
        {/* <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-7 py-2.5 text-sm rounded-md" children="취소" /> */}
      </div>
    </div>
  );
};
export default BookRequestFormComponent;