import { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { API_ENDPOINTS, API_SERVER_HOST } from '../../api/config';
import { updateEbook, deleteEbook } from '../../api/adminApi';
import { useBookMutation } from "../../hooks/useBookMutation";
import Loading from '../../routers/Loading';


const EbookDetailComponent = ({ eBook, setIsModalOpen }) => {

      useEffect(() => {
        const dummyBlob = new Blob(['warmup'], { type: 'text/plain' });
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("FileReader 워밍업 완료.");
        };
        reader.readAsDataURL(dummyBlob);

      }, []);

    const [formData, setFormData] = useState({
        ebookTitle: eBook.ebookTitle || '',
        ebookAuthor: eBook.ebookAuthor || '',
        ebookPublisher: eBook.ebookPublisher || '',
        ebookIsbn: eBook.ebookIsbn || '',
        ebookPubDate: eBook.ebookPubDate || '',
        ebookDescription: eBook.ebookDescription || ''
    });

    const [selectedImage, setSelectedImage] = useState(eBook.ebookCover || null);
    const [ selectedFile, setSelectedFile ] = useState(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const handleModalClose = () => {
        setIsModalOpen(false);
    }

    const updateEbookMutation = useBookMutation(async (data) => await updateEbook(data), { successMessage: "EBOOK을 수정했습니다.", queryKeyToInvalidate: 'ebookList'} );
    const deleteEbookMutation = useBookMutation(async (ebookId) => await deleteEbook(ebookId), { successMessage: "EBOOK을 삭제했습니다.", queryKeyToInvalidate: 'ebookList', onReset: handleModalClose } );


    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageSelect = (event) => {
        setIsUploading(true);
        const file = event.target.files[0];
        console.log('선택된 파일:', file);
        if (file) {
            console.log('파일 타입:', file.type);
            console.log('파일 크기:', file.size);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setSelectedImage(event.target.result);
                    setIsUploading(false);
                };
                reader.readAsDataURL(file);
                setSelectedFile(file);
            } else {
                alert('이미지 파일만 선택해주세요.');
                setIsUploading(false);
            }
        } else {
            setIsUploading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };


    const handleImageRemove = (e) => {
        e.stopPropagation();
        setSelectedImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };




    const handleUpdate = () => {

        const updateFormData = new FormData();
        updateFormData.append('ebookTitle', formData.ebookTitle);
        updateFormData.append('ebookAuthor', formData.ebookAuthor);
        updateFormData.append('ebookPublisher', formData.ebookPublisher);
        updateFormData.append('ebookIsbn', formData.ebookIsbn);
        updateFormData.append('ebookPubDate', formData.ebookPubDate);
        updateFormData.append('ebookDescription', formData.ebookDescription);
        updateFormData.append('ebookId', eBook.ebookId);
        if (eBook.ebookCover && selectedImage !== eBook.ebookCover) {
            updateFormData.append('isDelete', 'true');
            updateFormData.append('existingImagePath', eBook.ebookCover);
        }
        if (selectedFile) {
        updateFormData.append('ebookCover', selectedFile);
        }
        updateEbookMutation.mutate(updateFormData);

    };

    const handleDelete = () => {
        if (window.confirm("정말로 이 EBOOK을 삭제하시겠습니까?")) {
            deleteEbookMutation.mutate(eBook.ebookId);

        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 bg-black/50">
            {isUploading && <Loading text="이미지 업로드 중..." />}
            { updateEbookMutation.isPending && <Loading text="EBOOK 수정 중..." />}
            { deleteEbookMutation.isPending && <Loading text="EBOOK 삭제 중..." />}
            <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-7xl max-h-[90vh] overflow-auto">
                <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
                    <h3 className="font-bold">전자책 상세조회/수정</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="text-white text-xl hover:text-gray-200 hover:cursor-pointer">
                            &times;
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-white rounded-md shadow-sm mb-6">
                        <div className="p-5 flex gap-6">
                            <div className="flex-1 space-y-1">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 flex-shrink-0">도서명</label>
                                    <input
                                        type="text"
                                        value={formData.ebookTitle}
                                        onChange={(e) => handleInputChange('ebookTitle', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-9 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="도서명을 입력하세요"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">저자</label>
                                    <input
                                        type="text"
                                        value={formData.ebookAuthor}
                                        onChange={(e) => handleInputChange('ebookAuthor', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-9 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="저자를 입력하세요"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">출판사</label>
                                    <input
                                        type="text"
                                        value={formData.ebookPublisher}
                                        onChange={(e) => handleInputChange('ebookPublisher', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-9 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="출판사를 입력하세요"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">ISBN</label>
                                    <input
                                        type="text"
                                        value={formData.ebookIsbn}
                                        onChange={(e) => handleInputChange('ebookIsbn', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-9 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="ISBN을 입력하세요"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">출판일</label>
                                    <input
                                        type="date"
                                        value={formData.ebookPubDate}
                                        onChange={(e) => handleInputChange('ebookPubDate', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-9 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">등록일</label>
                                    <div className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 w-full min-h-9">{eBook.ebookRegDate}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start py-2.5 border-b border-gray-100">
                                    <label className="w-full sm:w-32 text-sm font-medium text-gray-600 mb-1 sm:mb-0 pt-1.5 flex-shrink-0">설명</label>
                                    <textarea
                                        value={formData.ebookDescription}
                                        onChange={(e) => handleInputChange('ebookDescription', e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 w-full min-h-32 resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="도서 설명을 입력하세요"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="w-80 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-600">표지</label>
                                    <span className="text-xs text-gray-500">클릭하여 이미지 변경</span>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <div
                                        className="h-96 border border-gray-300 rounded-md bg-gray-100 p-0 flex items-center justify-center relative cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                                        onClick={handleImageClick}
                                    >
                                        {selectedImage ? (
                                            <div className="relative group w-full h-full">
                                                <img
                                                    src={selectedImage === eBook.ebookCover ? `${API_SERVER_HOST}${API_ENDPOINTS.view}/${eBook.ebookCover}` : selectedImage}
                                                    alt="전자책 표지"
                                                    className="w-full h-full object-fill"
                                                    onError={(e) => {
                                                        console.log('Main image load error. Trying placeholder.');
                                                        e.target.src = '/placeholder-book.png';
                                                    }}
                                                />

                                                {selectedImage && (
                                                    <button
                                                        onClick={handleImageRemove}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                        title="이미지 제거"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 hover:text-gray-600 transition-colors p-4">
                                                <div className="text-4xl mb-2">📷</div>
                                                <div className="text-sm font-medium">이미지 업로드</div>
                                                <div className="text-xs mt-1">클릭하여 이미지 선택</div>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            children="수정"
                            onClick={handleUpdate}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700"
                        />
                        <Button
                            children="삭제"
                            onClick={handleDelete}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600"
                        />
                        <Button
                            children="닫기"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EbookDetailComponent;