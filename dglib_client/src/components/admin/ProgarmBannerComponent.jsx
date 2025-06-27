import { useEffect, useState, useRef } from "react";
import Button from "../common/Button";
import ProgramBannerSearchComponent from "./ProgramBannerSearchComponent";
import { getProgramBanners, registerProgramBanner, deleteProgramBanner, getProgramBannerImageUrl } from "../../api/programApi";

const ProgramBannerComponent = () => {
    const [banners, setBanners] = useState([]);
    const [registerForms, setRegisterForms] = useState([]);
    const [showSearch, setShowSearch] = useState(null);
    const fileInputRefs = useRef([]);
    const MAX_COUNT = 6;

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length === 0 && registerForms.length === 0) {
            setRegisterForms([{ programInfoId: null, programName: '', file: null }]);
        }
    }, [banners]);

    const fetchBanners = async () => {
        try {
            const res = await getProgramBanners();
            setBanners(res);
        } catch (err) {
            console.error("배너 조회 실패", err);
        }
    };

    const handleAddForm = () => {
        if (registerForms.length + banners.length >= MAX_COUNT) {
            alert("배너는 최대 6개까지 등록할 수 있습니다.");
            return;
        }
        setRegisterForms([...registerForms, { programInfoId: null, programName: '', file: null }]);
    };


    const handleProgramSelect = (index, program) => {
        if (banners.length >= MAX_COUNT) {
            alert("배너는 최대 6개까지 등록할 수 있습니다. 기존 배너를 삭제해주세요.");
            return;
        }

        const newForms = [...registerForms];

        // 이미 등록된 프로그램인지 확인
        const isDuplicate = banners.some(b => b.programInfoId === program.progNo) ||
            newForms.some((f, i) => i !== index && f.programInfoId === program.progNo);

        if (isDuplicate) {
            alert("이미 등록된 배너입니다.");
            return;
        }

        newForms[index].programInfoId = program.progNo;
        newForms[index].programName = program.progName;
        setRegisterForms(newForms);
        setShowSearch(null);
    };

    const handleFileChange = (index, file) => {
        const newForms = [...registerForms];
        newForms[index].file = file;
        setRegisterForms(newForms);
    };

    const handleRegister = async (index) => {
        // 등록 제한: 최대 6개
        if (banners.length >= MAX_COUNT) {
            alert("이미 등록 개수를 초과 하였습니다.");
            setRegisterForms(forms => forms.filter((_, i) => i !== index));
            return;
        }

        const { programInfoId, file } = registerForms[index];
        if (!programInfoId || !file) {
            alert("프로그램과 이미지를 모두 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("programInfoId", programInfoId);
        formData.append("file", file);

        try {
            await registerProgramBanner(formData);
            alert("등록 완료되었습니다.");
            fetchBanners();
            setRegisterForms(forms => forms.filter((_, i) => i !== index));
        } catch (err) {
            console.error("배너 등록 실패", err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                "배너 등록 중 오류가 발생했습니다.";

            alert(errorMessage);

            // 서버에서도 최대 개수 초과로 거절될 수 있으니 폼 제거 추가
            if (errorMessage.includes("최대 6")) {
                setRegisterForms(forms => forms.filter((_, i) => i !== index));
            }
        }
    };

    const handleDelete = async (bno) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteProgramBanner(bno);
            alert("삭제 완료되었습니다.");
            fetchBanners();
        } catch (err) {
            console.error("배너 삭제 실패", err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 상단 추가 버튼 */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAddForm}
                    className="text-3xl font-bold text-green-700 hover:text-green-800 cursor-pointer"
                    title="배너 추가"
                >
                    ＋
                </button>
            </div>

            {/* 등록 폼 카드 */}
            {registerForms.map((form, index) => (
                <div key={index} className="bg-white w-full max-w-4xl p-6 rounded-xl border border-gray-100 shadow">
                    <div className="flex items-start gap-8">

                        {/* 프로그램 선택, 이미지 업로드 */}
                        <div className="flex-1 flex flex-col space-y-8">
                            <div className="flex items-center gap-3">
                                <p className="font-semibold text-s text-gray-700">
                                    {form.programName || "프로그램을 선택해주세요"}
                                </p>
                                <Button onClick={() => setShowSearch(index)} className="text-xs bg-orange-400 hover:bg-orange-500 font-semibold px-2 py-1">검색</Button>
                            </div>

                            <div className="text-start space-y-1">
                                <label
                                    htmlFor={`file-upload-${index}`}
                                    className="flex items-center cursor-pointer"
                                >
                                    <img
                                        src="/upload.png"
                                        alt="업로드 아이콘"
                                        className="w-8 h-8 align-middle"
                                    />
                                    <span className="text-sm font-bold text-gray-600 hover:underline">
                                        이미지 첨부
                                    </span>

                                    <input
                                        id={`file-upload-${index}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleFileChange(index, e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                {form.file && (
                                    <div className="text-xs text-gray-600">
                                        {form.file.name}
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-xs text-gray-500">※ 권장 사이즈: 1200x400px</p>
                        </div>

                        {/* 이미지 업로드 및 이미지 미리보기 */}
                        <div
                            className="relative w-36 h-36 border border-gray-300 shadow rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                            onClick={() => fileInputRefs.current[index]?.click()}
                            title="클릭하여 이미지 업로드"
                        >
                            {form.file ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(form.file)}
                                        alt="미리보기"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newForms = [...registerForms];
                                            newForms[index].file = null;
                                            setRegisterForms(newForms);
                                        }}
                                        className="absolute top-1 right-1 text-white bg-black/50 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/60 cursor-pointer"
                                        title="이미지 제거"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <span className="text-xs text-gray-500">이미지 미리보기</span>
                            )}

                            <input
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, e.target.files[0])}
                                className="hidden"
                            />
                        </div>

                        <div className="flex flex-col-reverse items-center gap-7">
                            <Button
                                onClick={() => handleRegister(index)}
                                className="text-sm px-3 py-1 bg-green-700 text-white"
                            >
                                등록
                            </Button>
                            <button
                                onClick={() => setRegisterForms(forms => forms.filter((_, i) => i !== index))}
                                className="text-red-600 hover:text-red-700 text-xl font-bold cursor-pointer"
                                title="삭제"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* 검색 모달 */}
                    {showSearch === index && (
                        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center">
                            <ProgramBannerSearchComponent
                                onSelect={program => handleProgramSelect(index, program)}
                                onClose={() => setShowSearch(null)}
                            />
                        </div>
                    )}
                </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {banners.map(banner => (
                    <div key={banner.bno} className="border border-gray-200 rounded-xl shadow-sm p-2">
                        <img
                            src={getProgramBannerImageUrl(banner.thumbnailPath)}
                            alt="banner"
                            className="w-full h-32 object-cover"
                        />
                        <p className="text-sm text-center mt-2">프로그램: {banner.programInfoId}</p>
                        <div className="flex justify-center mt-4 mb-2">
                            <Button
                                onClick={() => handleDelete(banner.bno)}
                                className="bg-red-700 hover:bg-red-800 text-xs rounded-md"
                            >
                                삭제</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgramBannerComponent;