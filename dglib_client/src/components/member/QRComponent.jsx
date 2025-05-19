import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect, useCallback } from 'react';
import { cardPost } from '../../api/memberApi';
import { useQuery } from '@tanstack/react-query';

const QRComponent = ({mid}) => {

const reloadTime = 1000 * 30;
const [ leftTime, setLeftTime] = useState(reloadTime/1000);
const [ reload, setReload ] = useState(false);

const { data, error, isLoading } = useQuery({
    
    queryKey : ['card', reload],
    queryFn: () => cardPost(mid),
    staleTime : Infinity,
    enabled: !!mid,
    });

const handleReload = useCallback(() => {
    console.log("리로드")
    setReload(prev => !prev);
    setLeftTime(reloadTime/1000)
},[]);


useEffect(()=>{

const interval = setInterval(()=>{
 setLeftTime(prev =>{
    if(prev <= 1 ){
        handleReload();
        return prev;
    }
        return prev - 1;
    })

 },1000)

return () => clearInterval(interval);
},[]);



return(
    <>
    <div div className="flex justify-center">남은 시간 : {leftTime} </div>
    {isLoading && <div>QR 불러오는중..</div> }
    {error && <div>QR 불러오기 오류</div> }
    {data && <div className="flex justify-center mt-2"><QRCodeCanvas value={JSON.stringify(data)} size={128} /></div>}
    </>
)
}

export default QRComponent;