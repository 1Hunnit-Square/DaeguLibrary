import { useState, useEffect } from "react";
import { regEbook,  } from "../../api/adminApi";
import Button from "../common/Button";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../routers/Loading";

const initialEbookFormData = {
  ebookTitle: "",
  ebookAuthor: "",
  ebookPublisher: "",
  ebookPubDate: "",
  ebookIsbn: "",
  ebookDescription: "",
  ebookCoverPreview: "",
  ebookCover: null,
  ebookFile: null,
};


const RegEbookComponent = () => {
  const [bookFormData, setBookFormData] = useState(initialEbookFormData);
  const [ isUploading, setIsUploading ] = useState(false);

  const regBookMutation = useMutation({
    mutationFn: async (eBookData) => {
      const response = await regEbook(eBookData);
      return response;
    },
    onSuccess: () => {
      alert("도서 등록이 완료되었습니다.");
      setBookFormData(initialEbookFormData);
    },
    onError: (error) => {
      alert(error.response.data.message);
    },
  });

  useEffect(() => {
    const dummyBlob = new Blob(['warmup'], { type: 'text/plain' });
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("FileReader 워밍업 완료.");
    };
    reader.readAsDataURL(dummyBlob);

  }, []);


  const sumbit = async () => {

    const isBookDataValid =
      bookFormData.ebookTitle &&
      bookFormData.ebookAuthor &&
      bookFormData.ebookPublisher &&
      bookFormData.ebookPubDate &&
      bookFormData.ebookIsbn &&
      bookFormData.ebookDescription &&
      bookFormData.ebookFile;

    if (!isBookDataValid ) {
      alert("도서정보를 모두 입력해주세요.");
      return;
    }
    if (!bookFormData.ebookCover && !confirm("표지 이미지가 없습니다. 그대로 저장하시겠습니까?")) {
        return;
    }

    regBookMutation.mutate(bookFormData);
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {(regBookMutation.isPending ) && (
        <Loading text={ regBookMutation.isPending && "도서 등록중입니다.." } />
      )}
      { isUploading && (
        <Loading text={ regBookMutation.isPending && "파일 업로드중입니다.." } />
        )}
      <div className="bg-white rounded-lg p-6 mb-6">
         <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-2">EPUB 업로드</label>
            <div
                className="p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-center"
                onClick={() => document.getElementById('epubFileInput').click()}
            >
                {bookFormData.ebookFile ? (
                    <div className="flex flex-col items-center">
                        <span className="text-green-600 mb-2">📚</span>
                        <span className="text-sm font-medium text-gray-700">{bookFormData.ebookFile.name}</span>
                        <span className="text-xs text-gray-500 mt-1">
                            크기: {(bookFormData.ebookFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 mb-2">📚</span>
                        <span className="text-gray-600 mb-1">EPUB 파일을 업로드하세요</span>
                        <span className="text-sm text-gray-400">클릭하여 파일 선택</span>
                    </div>
                )}
            </div>
            <input
                id="epubFileInput"
                type="file"
                accept=".epub"
                className="hidden"
                onChange={(e) => {
                    setIsUploading(true);
                    console.log("epub 업로드 시작")
                    const file = e.target.files[0];
                    if (file) {
                        if (file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub')) {
                            setBookFormData({...bookFormData, ebookFile: file});
                            setIsUploading(false);
                            console.log("epub 완료 시작")
                        } else {
                            alert('EPUB 파일만 업로드 가능합니다.');
                            e.target.value = '';
                            setIsUploading(false);
                        }
                    } else {
                        setIsUploading(false);
                    }
                }}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">

                <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-2">도서명</label>
                    <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={bookFormData.ebookTitle}
                    onChange={(e) => setBookFormData({...bookFormData, ebookTitle: e.target.value})}
                    placeholder="도서명을 입력하세요"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-2">저자</label>
                    <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={bookFormData.ebookAuthor}
                    onChange={(e) => setBookFormData({...bookFormData, ebookAuthor: e.target.value})}
                    placeholder="저자를 입력하세요"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-2">출판사</label>
                    <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={bookFormData.ebookPublisher}
                    onChange={(e) => setBookFormData({...bookFormData, ebookPublisher: e.target.value})}
                    placeholder="출판사를 입력하세요"
                    />
                </div>
                </div>

                <div className="space-y-4">
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-2">출판일</label>
                    <input
                    type="date"
                    className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={bookFormData.ebookPubDate}
                    onChange={(e) => setBookFormData({...bookFormData, ebookPubDate: e.target.value})}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-2">ISBN</label>
                    <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                    value={bookFormData.ebookIsbn}
                    onChange={(e) => setBookFormData({...bookFormData, ebookIsbn: e.target.value})}
                    placeholder="ISBN을 입력하세요"
                    />
        </div>
  </div>
</div>

<div className="flex gap-8 mt-6">
    <div className="flex-1">
        <label className="font-medium text-gray-700 block mb-2">도서 설명</label>
          <textarea className="w-full h-96 p-4 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#00893B]"
            placeholder="도서 설명을 입력하세요"
            value={bookFormData.ebookDescription}
            onChange={(e) => setBookFormData({...bookFormData, ebookDescription: e.target.value})}
          />
    </div>
            <div className="w-72 flex flex-col">
                <label className="font-medium text-gray-700 block mb-2">표지 이미지</label>
                <div
                    className="h-96 rounded-md border border-gray-200 overflow-hidden p-0 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => document.getElementById('coverImageInput').click()}
                >
                    {bookFormData.ebookCoverPreview ? (
                        <img
                            src={bookFormData.ebookCoverPreview}
                            alt="도서 표지"
                            className="w-full h-full object-fill"
                            onError={(e) => e.currentTarget.src = '/placeholder-image.png'}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col">
                            <span className="text-gray-500 mb-2">이미지 없음</span>
                            <span className="text-sm text-gray-400">클릭하여 이미지 업로드</span>
                        </div>
                    )}
                </div>
                <input
                    id="coverImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            if (!file.type.startsWith('image/')) {
                                alert('이미지 파일만 업로드 가능합니다.');
                                e.target.value = '';

                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                setBookFormData({...bookFormData, ebookCoverPreview: event.target.result, ebookCover: file});





                            };
                            reader.readAsDataURL(file);



                        }
                    }}
                />
            </div>
       </div>
      </div>
      <div className="flex justify-center">
        <Button onClick={sumbit} className="" children={"도서 등록하기"}/>
      </div>
    </div>
  );
};

export default RegEbookComponent;