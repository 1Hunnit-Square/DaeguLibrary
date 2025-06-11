import { useState } from "react";
import { searchLibraryBookbyLibraryBookId } from "../api/bookApi";


const LibraryBookSearchModalComponent = () => {

    const [librarybookId, setLibrarybookId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const handleSearch = (e) => {
        setLibrarybookId(e.target.value);
    }
    const ClickSearch = async () => {
        if (!librarybookId) {
            alert("도서번호를 입력해주세요.");
            return;
        }
        if (!/^\d+$/.test(librarybookId)) {
            alert("도서번호가 올바른 형식이 아닙니다.");
            return;
        }
        setIsLoading(true);

        const response = await searchLibraryBookbyLibraryBookId(librarybookId);
        console.log(response.content);
        setSearchResults(response.content);
        setIsLoading(false);
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
          <h1 className="text-3xl font-bold mb-6 text-center">도서 검색</h1>

          <div className="mb-6 flex justify-center">
            <input
              type="number"
              placeholder="도서번호를 입력하세요"
              className="border p-3 rounded-l w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={librarybookId}
              onChange={handleSearch}
              onKeyDown={(e) => {if (e.key === 'Enter' && !isLoading) {e.preventDefault(); ClickSearch();}}}
            />
            <button
              className="px-6 py-3 rounded-r text-white transition bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:bg-blue-300"
              onClick={ClickSearch}
              disabled={isLoading}
            >
              도서번호검색
            </button>
          </div>

          {searchResults && (
            <div className="shadow-md rounded-lg overflow-hidden mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">등록번호</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">도서명</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">저자</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">ISBN</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">청구번호</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">보관장소</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">출판사</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">출판일</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">대출여부</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold uppercase">예약여부</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {searchResults.map((book, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer transition-colors duration-200"
                      onClick={() => bookClick(index)}
                    >
                      <td className="py-3 px-4">{book.libraryBookId}</td>
                      <td className="py-3 px-4 font-medium">{book.bookTitle}</td>
                      <td className="py-3 px-4">{book.author}</td>
                      <td className="py-3 px-4">{book.isbn}</td>
                      <td className="py-3 px-4">{book.callSign}</td>
                      <td className="py-3 px-4">{book.location}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{book.publisher}</td>
                      <td className="py-3 px-4 text-center">{book.pubDate}</td>
                      <td className="py-3 px-4 text-center">{book.rented ? '대출중' : '대출가능'}</td>
                      <td className="py-3 px-4 text-center">{book.reserved ? '예약중' : "-"}</td>
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

    export default LibraryBookSearchModalComponent;