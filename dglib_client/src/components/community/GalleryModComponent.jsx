import { useEffect, useMemo } from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-tooltip/dist/react-tooltip.css';
import QuillComponent from "../common/QuillComponent";
import { modGallery, getGalleryDetail } from "../../api/galleryApi";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../routers/Loading";
import { imgReplace } from "../../util/commonUtil";

const GalleryModComponent = () => {
  const navigate = useNavigate();
  const { moveToLogin } = useMoveTo();
  const mid = useRecoilValue(memberIdSelector);
  const { gno } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['galleryDetail', gno],
    queryFn: () => getGalleryDetail(gno),
    refetchOnWindowFocus: false,
  });

  const dataMap = useMemo(() => ({
    data: { ...data, content: imgReplace(data?.content) },
    fileDTOName: "imageDTO"
  }), [data]);

  const sendParams = (paramData) => {
    // ✅ paramData는 FormData 타입이므로, 새로운 FormData로 변환
    const newFormData = new FormData();

    // ✅ 기존 FormData의 key들을 순회하면서 서버에서 기대하는 이름으로 바꿔줌
    for (let [key, value] of paramData.entries()) {
      if (key === "files") {
        // 새로 업로드된 파일은 imageDTO라는 이름으로 변경
        newFormData.append("imageDTO", value); // ← 중요
      } else if (key === "oldFiles") {
        // 기존 파일 경로는 oldImagePaths로 변경
        newFormData.append("oldImagePaths", value); // ← 중요
      } else {
        // 나머지는 그대로 유지 (title, content 등)
        newFormData.append(key, value);
      }
    }

    // 요청 전 확인용 콘솔 출력
    console.log("[수정 요청 전송]", ...newFormData.entries());

    // 수정 요청 실행
    modGallery(gno, newFormData)
      .then(res => {
        alert("글을 수정하였습니다.");
        navigate(`/community/gallery/${gno}`);
      })
      .catch((error) => {
        alert("글 수정에 실패했습니다.");
        console.error(error);
      });
  };

  const onBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!mid) moveToLogin();
  }, []);

  return (
    <div className="flex flex-col justify-center bt-5 mb-10">
      {isLoading && <Loading />}
      {mid && data && (
        <QuillComponent
          onParams={sendParams}
          onBack={onBack}
          useTitle={true}
          usePublic={false}
          upload={["image"]}
          modMap={dataMap}
        />
      )}
    </div>
  );
};

export default GalleryModComponent;
