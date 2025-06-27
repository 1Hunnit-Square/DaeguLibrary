import { useEffect, useMemo } from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-tooltip/dist/react-tooltip.css';
import QuillComponent from "../common/QuillComponent";
import { modGallery, getGalleryDetail } from "../../api/galleryApi";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector, memberRoleSelector } from "../../atoms/loginState";
import { useMoveTo } from "../../hooks/useMoveTo";
import { useQuery, useQueryClient  } from "@tanstack/react-query";
import Loading from "../../routers/Loading";
import { imgReplace } from "../../util/commonUtil";

const GalleryModComponent = () => {
  const navigate = useNavigate();
  const { moveToLogin } = useMoveTo();
  const mid = useRecoilValue(memberIdSelector);
  const role = useRecoilValue(memberRoleSelector);
  const { gno } = useParams();

    useEffect(() => {

    if (!mid) {
      moveToLogin();
      return;
    }

    if (role != "ADMIN") {
      alert("글 수정 권한이 없습니다.");
      navigate("/community/gallery", { replace: true });
    }

  }, []);
  
  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData(['galleryDetail', gno]);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['galleryDetail', gno],
    queryFn: () => getGalleryDetail(gno),
    refetchOnWindowFocus: false,
    enabled: !cached, // 캐시 없으면 실행
    initialData: cached
  });



  const dataMap = useMemo(() => ({ data: { ...data, content: imgReplace(data?.content) }, fileDTOName: "imageDTO" }), [data]);

  const sendParams = (paramData, post) => {

    console.log(paramData);

    if (!paramData.get("files") && !paramData.get("oldFiles")){
            alert("이미지를 반드시 첨부해야합니다.");
            post.setPost(false);
            return ;
        }

    modGallery(gno, paramData)
      .then(res => {
        alert("글을 수정하였습니다.");
        navigate(`/community/gallery/${gno}`);
      })
      .catch((error) => {
        alert("글 수정에 실패했습니다.");
        console.error(error);
      }).finally(()=>{
      post.setPost(false);
})
  };

  const onBack = () => {
    navigate(-1);
  };



  return (
    <div className="flex flex-col justify-center bt-5 mb-10">
      {isLoading && <Loading />}
      {mid && data && (
        <QuillComponent
          onParams={sendParams}
          onBack={onBack}
          useTitle={true}
          usePinned={false}
          usePublic={false}
          upload={["image"]}
          modMap={dataMap}
        />
      )}
    </div>
  );
};

export default GalleryModComponent;
