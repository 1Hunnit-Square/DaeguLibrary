import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { getCard } from '../../api/memberApi';
import { useQuery } from '@tanstack/react-query';

const QrComponent = ({mid}) => {

const reloadTime = 1000 * 60;
const [ nowTime, setNowTime ] = useState(null);
const endRef = useRef(null);


const { data, error, isLoading, refetch } = useQuery({
    
    queryKey : ['card'],
    queryFn: () => {
        return getCard({mid : mid});
    },
    enabled: !!mid,
    refetchOnWindowFocus: false,
    });

const handleReload = () => {
    console.log("리로드")
    refetch();
}

useEffect(()=>{
        const now = new Date();
        const afterSec = new Date(now.getTime() + reloadTime);
        setNowTime(now);
        endRef.current = afterSec;
        

const interval = setInterval(()=>{
    setNowTime(prev => {
        const now = new Date();
        if(now >= endRef.current){
            handleReload();
        }

        return now;
    })


 },1000)

return () => clearInterval(interval);
},[data]);



return(
    <>
    {isLoading && <div className="flex justify-center">QR 불러오는중..</div> }
    {error && <div className="flex justify-center">QR 불러오기 오류</div> }
    {data && <div className="flex justify-center mb-2"><QRCodeCanvas value={JSON.stringify(data)} size={128} /></div>}
    <div className="flex justify-center">남은 시간 : {Math.max(0, ((endRef.current - nowTime) / 1000)).toFixed(0)} </div>
    </>
)
}

export default memo(QrComponent);