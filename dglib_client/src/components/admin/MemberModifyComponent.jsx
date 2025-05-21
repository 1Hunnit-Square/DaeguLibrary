import { useMemo, useState } from "react";
import Button from "../common/Button";
import SelectComponent from "../common/SelectComponent";

const MemberModifyComponent = ({data}) => {
    const [modData, setModData] = useState({role: data.role, state : data.state, penalty : data.penaltyDays});

    const penaltyDate = useMemo(()=>{
        if(modData.penalty == 0)
            return "";
        const today = new Date();
        today.setDate(today.getDate()+modData.penalty-1);
        return today.toISOString().slice(0, 10);
    },[modData])

    const roleMap = {
            "정회원": "USER",
            "사서" : "MANAGER",
            "관리자" : "ADMIN",
        };
    const stateMap = {
            "일반계정": "NORMAL",
            "연체계정" : "OVERDUE",
            "제재계정" : "PUNISH",
            "탈퇴계정" : "LEAVE"
        };

    const handleRole = (value) => {
        setModData(prev => ({
            ...prev,
            ["role"] : value
        }))
    }

    const handleState = (value) => {
        setModData(prev => ({
            ...prev,
            ["state"] : value
        }))
    }

    const handlePenalty = (e) => {
        if(new Date(e.target.value) <= new Date()){
            alert("날짜가 현재 날짜보다 이후여야 합니다.");
            return;
        }
        const inputDate = new Date(e.target.value).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);
        const diffDays = Math.floor((inputDate - today) / (1000 * 60 * 60 * 24));
        setModData(prev => ({
            ...prev,
            ["penalty"] : diffDays + 1
        }))
        console.log(diffDays + 1);
    }

    return (<div className="ml-5">
    <div className = "font-bold mt-3 mb-8 text-xl">{`회원ID : ${data.mid} (${data.name})`} </div>
    <div className="flex items-center mb-5 z-50 relative">
    <span className="mr-3 font-bold">권한</span>
    <SelectComponent name="role" onChange={handleRole} value={modData.role}  options={roleMap} />
    </div>
    <div className="flex items-center mb-5 z-30 relative">
    <span className="mr-3 font-bold">상태</span>
    <SelectComponent name="state" onChange={handleState} value={modData.state}  options={stateMap} />
    {(modData.state == "OVERDUE" || modData.state =="PUNISH") ? <><input type="date" value={penaltyDate} onChange={handlePenalty}
    className ="w-37 px-4 py-2 rounded-2xl bg-white border border-[#00893B] mr-3" /> 까지</>
    : <><input type="date" value={""}
    className ="w-37 px-4 py-2 rounded-2xl bg-gray-200 border border-gray-300 mr-3" disabled={true} /> 까지</>}
    </div>
    <div className="flex mt-10 gap-2 mr-4 justify-end">

        <Button className="bg-red-500 hover:bg-red-600">회원삭제</Button>
        <Button>변경</Button>
    </div>
    
    </div>);
}

export default MemberModifyComponent;