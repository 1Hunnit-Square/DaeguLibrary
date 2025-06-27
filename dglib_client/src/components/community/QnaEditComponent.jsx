import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { memberIdSelector } from "../../atoms/loginState";
import { getQnaDetail } from "../../api/qnaApi";
import QuillComponent from "../common/QuillComponent";
import { useUpdateQuestion } from "../../hooks/useQuestionMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { imgReplace } from "../../util/commonUtil";
import Loading from "../../routers/Loading";

const QnaEditComponent = () => {
  const { qno } = useParams();
  const mid = useRecoilValue(memberIdSelector);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData(["qnaDetail", qno]);

  const { data, isLoading } = useQuery({
    queryKey: ["qnaDetail", qno],
    queryFn: () => getQnaDetail(qno, mid),
    enabled: !cached,
    initialData: () => cached,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useUpdateQuestion();

  const modData = useMemo(() => {
    if (!data) return null;
    return {
      data: {
        ...data,
        content: imgReplace(data?.content),
      },
    };
  }, [data]);

  useEffect(() => {
    if (!mid) navigate("/login");
  }, [mid, navigate]);

  const handleBack = () => navigate(-1);

  const handleUpdate = (paramData, post) => {
    const title = paramData.get("title");
    const content = paramData.get("content");
    const checkPublic = paramData.get("checkPublic") === "true";

    updateMutation.mutate({
      qno,
      updateData: {
        title,
        content,
        checkPublic,
        writerMid: mid,
      },
    },{
    onSettled: () => {
      post.setPost(false);
    }});
  };

  if (isLoading || !modData) return <Loading />;

  return (
    <div className="flex flex-col justify-center bt-5 mb-10">
      <QuillComponent
        onParams={handleUpdate}
        onBack={handleBack}
        useTitle={true}
        usePinned={false}
        usePublic={true}
        upload={[]}
        modMap={modData}
      />
    </div>
  );
};

export default QnaEditComponent;
