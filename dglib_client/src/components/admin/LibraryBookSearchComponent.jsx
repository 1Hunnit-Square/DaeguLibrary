import { useState } from "react";
import { searchByLibraryBookId } from "../../api/adminApi";
import { useMutation } from '@tanstack/react-query';
import Button from "../common/Button";
import Loading from "../../routers/Loading";


const LibraryBookSearchComponent = () => {

    const [librarybookId, setLibrarybookId] = useState("");
    const [searchResults, setSearchResults] = useState(null);

     const searchMutation = useMutation({
            mutationFn: async (memberNumber) => {
                return await searchByLibraryBookId(memberNumber);
            },
            onSuccess: (response) => {
                console.log(response.content);
                setSearchResults(response.content);
            },
            onError: (error) => {
                console.log("도서 검색 오류:", error);
                alert("도서 검색에 실패했습니다. " + error.response?.data?.message);
            }
        });

    const handleSearch = (e) => {
        setLibrarybookId(e.target.value);
    };
    const ClickSearch = () => {
        if (!librarybookId) {
            alert("도서번호를 입력해주세요.");
            return;
        }
        if (!/^\d+$/.test(librarybookId)) {
            alert("도서번호가 올바른 형식이 아닙니다.");
            return;
        }

        searchMutation.mutate(librarybookId);
    }
    const bookClick = (e) => {
        if (searchResults[e].rented) {
            alert("대출중인 도서입니다.");
            return;
        }
        if (searchResults[e].reserved) {
            alert("예약중인 도서입니다.");
            return;
        }

        if (window.opener) {
            window.opener.postMessage({
                type: 'BOOK_SELECTED',
                libraryBookId: searchResults[e].libraryBookId,
                bookTitle: searchResults[e].bookTitle,

            }, '*');
            window.close();
        }


    }



     return (
        <div className="max-w-7xl mx-auto p-8">
            {searchMutation.isPending && (
                    <Loading text={ "도서 검색중입니다.."} />
                  )}
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#00893B] text-[#00893B]">도서 검색</h2>
                    <div className="flex items-center mx-auto justify-center w-120 gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="도서번호를 입력하세요"
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                            value={librarybookId}
                            onChange={handleSearch}
                            onKeyDown={(e) => {if (e.key === 'Enter' && !searchMutation.isPending) {e.preventDefault(); ClickSearch();}}}
                        />
                        <Button
                            onClick={!searchMutation.isPending ? ClickSearch : undefined}
                            disabled={searchMutation.isPending}
                            children="검색"
                        />
                    </div>

          {searchResults && (
            <div className="shadow-md rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-[#00893B] text-white">
                    <tr>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[8%]">등록번호</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[18%]">도서명</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[12%]">저자</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[10%]">ISBN</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[8%]">청구번호</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[10%]">보관장소</th>
                      <th className="py-3 px-2 text-left text-sm font-semibold uppercase w-[10%]">출판사</th>
                      <th className="py-3 px-2 text-center text-sm font-semibold uppercase w-[8%]">출판일</th>
                      <th className="py-3 px-2 text-center text-sm font-semibold uppercase w-[6%]">대출</th>
                      <th className="py-3 px-2 text-center text-sm font-semibold uppercase w-[15%]">상태</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {searchResults.map((book, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200"
                        onClick={() => bookClick(index)}
                      >
                        <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap" title={book.libraryBookId}>{book.libraryBookId}</td>
                        <td className="py-2 px-2 font-medium max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={book.bookTitle}>{book.bookTitle}</td>
                        <td className="py-2 px-2 max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap" title={book.author}>{book.author}</td>
                        <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap" title={book.isbn}>{book.isbn}</td>
                        <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap" title={book.callSign}>{book.callSign}</td>
                        <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap" title={book.location}>{book.location}</td>
                        <td className="py-2 px-2 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap" title={book.publisher}>{book.publisher}</td>
                        <td className="py-2 px-2 text-center overflow-hidden text-ellipsis whitespace-nowrap" title={book.pubDate}>{book.pubDate}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-1 py-1 text-xs font-semibold rounded-full ${
                            book.rented || book.reserved ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                          }`}>
                            {book.rented || book.unmanned ||  book.reserved ? "불가" : "가능"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-1 py-1 text-xs font-semibold rounded-full ${
                            book.reserved ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                          }`}>
                            {(book.unmmaned || book.rented) && book.reserved ? "대출 및 예약중" : book.unmmaned || book.rented ? '대출중' : book.reserved ? "예약중" : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    );
}

export default LibraryBookSearchComponent;