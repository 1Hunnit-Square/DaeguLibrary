import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { QrScan } from '../../api/memberApi';
import Button from '../common/Button';
import { useRecoilValue } from 'recoil';
import { memberRoleSelector } from '../../atoms/loginState';




const QRScanComponent = ({handleScanner = null}) => {

    const role = useRecoilValue(memberRoleSelector);
   const [result, setResult] = useState({});
  const QrRef = useRef(null);
  const lastResultRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [ camId, setCamId ] = useState("");
  const TimeRef = useRef(0);
  const scannerId = "reader";

useEffect(()=>{
        if(!(role == "ADMIN" || role == "MANAGER")){
            alert("접근 권한이 없습니다.");
            return;
        }
        Html5Qrcode.getCameras()
      .then(devices => {
        setCameras(devices);
      });
    },[])

  useEffect(() => { 
    if(cameras.length < 1) return; 
    if(QrRef.current){
      QrRef.current = null;
    }
    QrRef.current = new Html5Qrcode(scannerId);
    const scanCam = camId ? camId :  { facingMode: "environment" };
    QrRef.current
      .start(
        scanCam ,
        {
          fps: 10,
          qrbox: (width, height) => {
            const edge = Math.min(width, height);
            return { width: edge * 0.8, height: edge * 0.8 };
          },
          aspectRatio: 1.0,
        },
        async (result) => {
            const now = Date.now();
            const isSameResult = result === lastResultRef.current;
            const timeLimit = now - TimeRef.current < 5000;

             if (isSameResult && timeLimit) {
                return;
            }

            lastResultRef.current = result;
            TimeRef.current = now;

          let param;
          try{
            param = JSON.parse(result);
          } catch(e){
            alert("회원증 QR코드 형식이 아닙니다.");
            return;
          }

            QrScan(param).then(res => {
                setResult(res);
                if(handleScanner){
                    handleScanner(res);
                }

          }).catch( error => {
            alert("QR 검증 오류");
          })



        },
        (error) => {

        }
      )
      .catch((err) => {
        alert("카메라 접근 오류: " + err);
      });

    return () => handleStopCam();

  }, [cameras, camId]);

  const handleSelectCam = (e) => {
    setCamId(e.target.value);
  }

const handleStopCam = () => {
  if (!QrRef.current) return;

  const currentScanner = QrRef.current;
  QrRef.current = null;

  currentScanner
    .stop()
    .catch((e) => {
      console.warn("정리 중 오류", e); // 전체 오류 로그 확인
    });
};

  return (
    <div className="mx-auto p-3 w-90 text-center">
      <h1 className="font-bold text-4xl my-5" >
        회원증 스캐너
      </h1>
      {cameras.length > 1 && (
        <select
          className="mb-4 p-2 border rounded"
          onChange={handleSelectCam}
          value={camId || ""}
        >
            <option value="">기본 설정 카메라</option>
          {cameras.map((cam, i) => (
            <option key={cam.id} value={cam.id}>
              {cam.label || `카메라 ${i + 1}`}
            </option>
          ))}
        </select>
      )}
      <div
        id={scannerId}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          marginBottom: 20,
        }}
      />
       
      
      {result?.mno && !handleScanner && (<>
        <div className="text-2xl mb-4 font-bold" >QR 코드 스캔 결과</div>
  <div className="text-lg text-gray-700 font-semibold mx-auto max-w-md border border-gray-400">
    <table className="table-auto w-full rounded overflow-hidden">
      <tbody>
        <tr className="border-b border-b-gray-300">
          <td className="px-4 py-2 bg-gray-100 font-bold">회원번호</td>
          <td className="px-4 py-2">{result.mno}</td>
        </tr>
        <tr className="border-b border-b-gray-300">
          <td className="px-4 py-2 bg-gray-100 font-bold">이름</td>
          <td className="px-4 py-2">{result.name}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 bg-gray-100 font-bold">유효시간</td>
          <td className="px-4 py-2">
            {result.expired ? (
              <span className="text-red-500">만료</span>
            ) : (
              <span className="text-blue-500">통과</span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </>
)}

    </div>
  );
}
export default QRScanComponent;