import { useState, useEffect } from "react";
import { regBook, regBookCheck, deleteLibraryBook } from "../../api/adminApi";
import Button from "../common/Button";
import { useMutation } from "@tanstack/react-query";
import SelectComponent from "../common/SelectComponent";
import Loading from "../../routers/Loading";


const initialBookFormData = {
  bookTitle: "",
  author: "",
  publisher: "",
  pubDate: "",
  isbn: "",
  description: "",
  cover: "",
};

const initialLibraryBooks = [{ id: 0, location: "", callSign: "", libraryBookId: "" }];

const RegBookComponent = () => {
  const [bookFormData, setBookFormData] = useState(initialBookFormData);
  const [libraryBooks, setLibraryBooks] = useState(initialLibraryBooks);
  const Location = ["자료실1", "자료실2", "자료실3"];

  const regBookMutation = useMutation({
    mutationFn: async (bookData) => {
      const response = await regBook(bookData);
      return response;
    },
    onSuccess: (data) => {
      alert("도서 등록이 완료되었습니다.");
      setBookFormData(initialBookFormData);
      setLibraryBooks(initialLibraryBooks);
    },
    onError: (error) => {
      alert(error.response.data.message);
    },
  });

  const getRegBookCheckMutation = useMutation({
    mutationFn: async (isbn) => {
      const response = await regBookCheck(isbn);
      return response;
    },
    onSuccess: (data) => {
      console.log(data);
      if (data.libraryBooks && data.libraryBooks.length > 0) {
        setLibraryBooks(
          data.libraryBooks.map((libraryBook, index) => ({
            id: index,
            location: libraryBook.location,
            callSign: libraryBook.callSign,
            libraryBookId: libraryBook.libraryBookId,
          }))
        )
      }
      if (data.book && data.book.bookTitle) {
        setBookFormData({
          bookTitle: data.book.bookTitle,
          author: data.book.author,
          publisher: data.book.publisher,
          pubDate: data.book.pubDate,
          isbn: data.book.isbn,
          description: data.book.description,
          cover: data.book.cover,
        });
      }
    },
    onError: (error) => {
      alert(error.response.data.message);
    },
  })

  const deleteLibraryBookMutation = useMutation({
    mutationFn: async (params) => {
      const { libraryBookId, isbn } = params;
      const response = await deleteLibraryBook(libraryBookId, isbn);
      return response;
    },
    onSuccess: (data) => {
      console.log(data);
      alert("도서 삭제가 완료되었습니다.");
      if (libraryBooks.length === 0) {
      resetBookInfo();
    }
    },
    onError: (error) => {
      alert(error.response.data.message);
    },
  })



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
    if (bookFormData.description === "" || bookFormData.description.trim() === "") {
      alert("도서 설명을 입력해주세요.");
      return;
    }


    if (!isBookDataValid || !isHoldingValid) {
      alert("도서정보를 모두 입력해주세요.");
      return;
    }

    const bookData = {
      book: {
        ...bookFormData,
      },
      libraryBooks: libraryBooks.map(({ location, callSign, libraryBookId }) => ({
        location,
        callSign,
        libraryBookId,
      })),
    };

    regBookMutation.mutate(bookData);
  };


  const resetBookInfo = () => {
    setBookFormData(initialBookFormData);
    setLibraryBooks(initialLibraryBooks);
  };

  const addHolding = () => {
    const newId = libraryBooks.length
      ? Math.max(...libraryBooks.map((e) => e.id)) + 1
      : 0;
    setLibraryBooks([
      ...libraryBooks,
      { id: newId, location: "", callSign: "" },
    ]);
  };

  const removeHolding = (id, libraryBookId) => {
    if (libraryBookId) {
      if (confirm("소장중인 도서입니다 정말 삭제하시겠습니까??")) {
        console.log(bookFormData.isbn);
        deleteLibraryBookMutation.mutate({
        libraryBookId,
        isbn: bookFormData.isbn
      })

    } else {
      return;
    }
    };
     setLibraryBooks(
      libraryBooks.filter((libraryBook) => libraryBook.id !== id)
    );
  }

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
        getRegBookCheckMutation.mutate(event.data.book.isbn);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const searchClick = () => {
    const windowName = "등록도서 검색"
    window.open(`/searchbookapi`, windowName, "_blank", "width=1200,height=800");
  };




  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {(regBookMutation.isPending || getRegBookCheckMutation.isPending) && (
        <Loading text={ regBookMutation.isPending ? "도서 등록중입니다.."  : "도서 정보 입력중입니다.." } />
      )}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <span className="font-semibold text-lg text-gray-700 mr-4">도서 검색</span>
          <div className="flex gap-2">
            <Button onClick={searchClick} className="" children="도서 검색" />
            {bookFormData.bookTitle && (
                <Button className="bg-red-700 hover:bg-red-800"
                children={"×"} onClick={resetBookInfo} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2">도서명</label>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                value={bookFormData.bookTitle}
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2">저자</label>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                value={bookFormData.author}
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2">출판사</label>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                value={bookFormData.publisher}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2">출판일</label>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                value={bookFormData.pubDate}
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2">ISBN</label>
              <input
                type="text"
                className="p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                value={bookFormData.isbn}
                readOnly
              />
            </div>

            <div className="flex flex-col items-end justify-end h-[73px]">
              {bookFormData.bookTitle && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ 도서 정보가 입력되었습니다
                </div>
              )}
              {bookFormData.isbn ? (
                libraryBooks.some(book => book.libraryBookId) ? (
                  <div className="text-sm text-green-600 font-medium">
                      ✓ 소장중인 도서입니다.
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 font-medium">
                      ✓ 신규 도서입니다
                    </div>
                  )
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex gap-8 mt-6">
            <div className="flex-1">
                <label className="font-medium text-gray-700 block mb-2">도서 설명</label>
                  <textarea className={`w-full h-96 p-4 border border-gray-300 rounded-md ${
                    !bookFormData.bookTitle ? 'bg-gray-50' : 'bg-white'} focus:outline-none focus:ring-1 focus:ring-[#00893B]`}
                    placeholder={bookFormData.bookTitle && !bookFormData.description && "도서 설명이 없습니다."}
                    value={bookFormData.bookTitle ? bookFormData.description : ""}
                    readOnly={!bookFormData.bookTitle}
                    onChange={(e) => { if (bookFormData.bookTitle) {
                        setBookFormData({
                            ...bookFormData,
                            description: e.target.value
                        })}}}/>
            </div>
            <div className="w-72 flex flex-col">
            <label className="font-medium text-gray-700 block mb-2">표지 이미지</label>
            <div className="h-96 rounded-md border border-gray-200 overflow-hidden p-0 bg-gray-50">
                {bookFormData.cover ? (
                <img
                    src={bookFormData.cover}
                    alt="도서 표지"
                    className="w-full h-full object-fill"
                    onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">이미지 없음</span>
                </div>
                )}
            </div>
         </div>
       </div>
      </div>

      <div className="bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#00893B]">소장정보</h3>
          <Button onClick={addHolding} children="+" className="bg-blue-500 hover:bg-blue-600" />
        </div>

        <div className="space-y-3">
          {libraryBooks.map((libraryBook) => (
            <div
              key={libraryBook.id}
              className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex flex-wrap md:flex-nowrap items-center gap-4 flex-1">
                <div className="flex flex-col w-full md:w-auto">
                  <label className="font-medium text-gray-700 mb-1">위치</label>
                  <SelectComponent
                  selectClassName="bg-white border dropdownClassName rounded-lg shadow-lg"
                  dropdownClassName="border-[#666666]"
                  value={libraryBook.location}
                  options={Location}
                  onChange={(e) => updateHolding(libraryBook.id, "location", e.target.value)} />
                </div>

                <div className="flex flex-col w-full md:w-auto">
                  <label className="font-medium text-gray-700 mb-1">청구기호</label>
                  <input
                    type="text"
                    className="p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B] w-full md:w-48"
                    value={libraryBook.callSign}
                    onChange={(e) => updateHolding(libraryBook.id, "callSign", e.target.value)}
                    placeholder="청구기호 입력"
                  />
                </div>
              </div>
              <Button onClick={() => removeHolding(libraryBook.id, libraryBook.libraryBookId)} children="삭제" className="bg-red-700 hover:bg-red-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={sumbit} className="" children={"도서 등록하기"}/>
      </div>
    </div>
  );
};

export default RegBookComponent;