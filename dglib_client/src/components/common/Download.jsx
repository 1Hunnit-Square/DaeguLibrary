import { useState, useEffect } from "react";
import { fileSize } from "../../util/commonUtil";

const Download = ({link, fileName, className, size = true, viewName = null}) => {

  const [length, setLength] = useState(null);



  const downloadFile = async (link) => {
    try {
      const response = await fetch(link, {
      });

      if (!response.ok) {
        throw new Error('파일을 가져오는데 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleLength = async (link) => {
    const response = await fetch(link, {});
    if (!response.ok) {
      return null;
    }
    const byteLength = response.headers.get('Content-Length');
    return byteLength;
  }



  useEffect(() => {
    handleLength(link).then(result => setLength(result));


  }, []);

  return (
    <button
    type="button"
    onClick={() => downloadFile(link)}
    className={`hover:underline cursor-pointer ${className}`}
  >
    {viewName ?? fileName} {size && fileSize(length)}
  </button>
  );
}
export default Download;