import { useState, useEffect } from "react";
import { regBook } from "../api/bookApi";

const initialBookFormData = {
  bookTitle: "",
  author: "",
  publisher: "",
  pubDate: "",
  isbn: "",
  description: "",
  cover: "",
};

const initialLibraryBooks = [{ id: 0, location: "", callSign: "" }];

const BookRegComponent = () => {
  const [bookFormData, setBookFormData] = useState(initialBookFormData);
  const [libraryBooks, setLibraryBooks] = useState(initialLibraryBooks);
  const addHolding = () => {
    const newId = libraryBooks.length
      ? Math.max(...libraryBooks.map((e) => e.id)) + 1
      : 0;
    setLibraryBooks([
      ...libraryBooks,
      { id: newId, location: "", callSign: "" },
    ]);
  };
  const removeHolding = (id) => {
    setLibraryBooks(
      libraryBooks.filter((libraryBook) => libraryBook.id !== id)
    );
  };
  const updateHolding = (id, field, value) => {
    setLibraryBooks(
      libraryBooks.map((libraryBook) =>
        libraryBook.id === id ? { ...libraryBook, [field]: value } : libraryBook
      )
    );
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "BOOK_SELECTED") {
        setLibraryBooks([{ id: 1, location: "", callSign: "" }]);
        setBookFormData({
          bookTitle: event.data.book.bookTitle,
          author: event.data.book.author,
          publisher: event.data.book.publisher,
          pubDate: event.data.book.pubDate,
          isbn: event.data.book.isbn,
          description: event.data.book.description,
          cover: event.data.book.cover,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const searchClick = () => {
    window.open(`/searchbookresult`, "_blank", "width=1200,height=800");
  };
  const sumbit = async () => {
    const isHoldingValid = libraryBooks.every(
      (libraryBook) =>
        libraryBook.location &&
        libraryBook.location.trim() !== "" &&
        libraryBook.callSign &&
        libraryBook.callSign.trim() !== ""
    );
    const isBookDataValid =
      bookFormData.bookTitle &&
      bookFormData.author &&
      bookFormData.publisher &&
      bookFormData.pubDate &&
      bookFormData.isbn &&
      bookFormData.description;
    if (!isBookDataValid || !isHoldingValid) {
      alert("도서정보를 모두 입력해주세요.");
      return;
    }
    const bookData = {
      book: {
        ...bookFormData,
      },
      libraryBooks: libraryBooks.map(({ location, callSign }) => ({
        location,
        callSign,
      })),
    };
    console.log("서버로 전송될 데이터:", bookData);
    console.log(bookData.book.pubDate);
    try {
      const response = await regBook(bookData);
      alert("도서 등록이 완료되었습니다.");
      setBookFormData(initialBookFormData);
      setLibraryBooks(initialLibraryBooks);
    } catch (error) {
      alert(error.response.data.message);
    }



  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">도서 등록</h2>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center">
              <label className="w-32 font-semibold">도서 검색</label>
              <button
                className="px-6 py-2 rounded text-white transition
                                            bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={searchClick}
              >
                도서검색
              </button>
            </div>

            <div className="flex items-center">
              <label className="w-32 font-semibold">도서명</label>
              <input
                type="text"
                className="flex-1 p-3 border rounded bg-white"
                value={bookFormData.bookTitle}
                readOnly
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-semibold">저자</label>
              <input
                type="text"
                className="flex-1 p-3 border rounded bg-white"
                value={bookFormData.author}
                readOnly
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-semibold">출판사</label>
              <input
                type="text"
                className="flex-1 p-3 border rounded bg-white"
                value={bookFormData.publisher}
                readOnly
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-semibold">출판일</label>
              <input
                type="text"
                className="flex-1 p-3 border rounded bg-white"
                value={bookFormData.pubDate}
                readOnly
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-semibold">ISBN</label>
              <input
                type="text"
                className="flex-1 p-3 border rounded bg-white"
                value={bookFormData.isbn}
                readOnly
              />
            </div>
            <div className="p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">도서 설명</h3>
              <div className="flex gap-8">
                <div className="flex-1">
                  <textarea
                    className="w-full h-80 p-4 border rounded bg-white"
                    value={bookFormData.description || "도서 설명이 없습니다."}
                    readOnly
                  />
                </div>
                {bookFormData.cover ? (
                  <img
                    src={bookFormData.cover}
                    alt="도서 표지"
                    className="w-64 h-auto object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-64 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">이미지 없음</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="w-32 font-semibold">소장정보</label>
                <button
                  onClick={addHolding}
                  className="p-1 rounded-full hover:bg-gray-100 text-blue-500 hover:text-blue-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              {libraryBooks.map((libraryBook) => (
                <div
                  key={libraryBook.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-4">
                    <p className="font-medium">위치</p>
                    <select
                      className="p-2 border rounded bg-white"
                      value={libraryBook.location}
                      onChange={(e) =>
                        updateHolding(
                          libraryBook.id,
                          "location",
                          e.target.value
                        )
                      }
                    >
                      <option value="" hidden></option>
                      <option value="자료실1">자료실1</option>
                      <option value="자료실2">자료실2</option>
                      <option value="자료실3">자료실3</option>
                    </select>
                    <p className="font-medium ml-4">청구기호</p>
                    <input
                      type="text"
                      className="p-2 border rounded bg-white w-40"
                      value={libraryBook.callSign}
                      onChange={(e) =>
                        updateHolding(
                          libraryBook.id,
                          "callSign",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeHolding(libraryBook.id)}
                    className="ml-auto px-3 py-1 rounded text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={sumbit}
            className="px-6 py-2 rounded text-white transition bg-blue-500 hover:bg-blue-600 cursor-pointer"
          >
            도서 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookRegComponent;
