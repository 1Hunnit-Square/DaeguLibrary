import Button from "../common/Button";
import { useState, useEffect } from "react";
import _ from 'lodash';

const SmsSendListComponent = ({numList, setNumList}) => {

    const [ phone, setPhone ] = useState("");


    
    useEffect(() => {
        const handleMessage = (event) => {
        const { type, newList } = event.data;

    if (type === 'CONTACT_SELECTED') {
        console.log('연락처 선택됨:', newList);
        setNumList(prev => _.uniq([...prev, ...newList]));
    }
    }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [numList]);

    const handleChange = (e) =>{
        if (/[^0-9]/.test(e.target.value)) return;

        setPhone(e.target.value);
    }

    const handleListAdd = () => {
        if(phone.length < 10){
            alert("전화번호를 제대로 입력해주세요");
            return;
        }
        
        setNumList(prev => _.uniq([...prev, phone]));
        setPhone("");
    }

    const handleListDel = (index) => {
        setNumList(prev => {
            const newList = [ ... prev];
            newList.splice(index,1)
            return newList;
        });
    }
    
    const phoneToStr = (phone) => {
        return `${phone.slice(0,3)}-${phone.slice(3, -4)}-${phone.slice(-4)}`;
    }

    const ClickSearch = () => {
       return window.open(`/smssearch`, "_blank", "width=1300,height=800");
    }

    return(
        <div className="flex flex-col gap-5 my-8">
        <div className ="flex gap-2 justify-center">
        <input type="text" className="border border-gray-300 rounded px-3 w-35 focus:outline-emerald-600" 
            maxLength={11} placeholder={"전화번호 추가"} onChange={handleChange} value={phone} />
        <Button onClick = {handleListAdd} className="bg-emerald-500 hover:bg-emerald-600 !p-1.5">추가</Button>
        <Button onClick={ClickSearch} className="bg-blue-500 hover:bg-blue-600 !p-1.5">검색</Button>
        </div>
        <div className ="border-4 border-emerald-700 w-80 h-100 rounded-lg overflow-y-auto py-5">
            <div className ="flex flex-col justify-center ml-10 w-60">
            <div className="text-lg font-bold">수신자 명단 ✉ <span className="text-sm font-normal">({numList.length}명)</span>
            <Button className="text-sm w-fit !p-1.5 ml-3 bg-amber-600 hover:bg-amber-700" onClick={()=>setNumList([])}>초기화</Button></div>
            <table className = "my-5 table-fixed">
                <thead className = "border-y-3 border-gray-400">
                    <tr>
                        <td className = "py-1 px-2 w-1/5 text-center whitespace-nowrap">순번</td>
                        <td className = "py-1 px-2 text-center whitespace-nowrap">번호</td>
                        <td className = "py-1 px-2 w-1/5 text-center whitespace-nowrap">  </td>
                    </tr>
                </thead>
                <tbody>
                    { numList.map( (value, index) =>
                    <tr key={index} className = "border-b-1 border-gray-200">
                        <td className = "py-1 px-2 text-center whitespace-nowrap" >{index+1}</td>
                        <td className = "py-1 px-2 text-center whitespace-nowrap" >{phoneToStr(value)}</td>
                        <td className = "py-1 px-2 text-center whitespace-nowrap">
                            <span onClick={()=>handleListDel(index)} className ="bg-red-400 rounded p-0.5 text-sm text-white hover:bg-red-500 cursor-pointer">삭제</span>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            </div>

        </div>
        </div>
    )

}

export default SmsSendListComponent;