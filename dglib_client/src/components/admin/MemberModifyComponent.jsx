import { useMemo, useState } from "react";
import Button from "../common/Button";
import SelectComponent from "../common/SelectComponent";
import { postMemberManage } from "../../api/memberApi";
import { memberIdSelector } from "../../atoms/loginState";
import { useRecoilValue } from "recoil";

const MemberModifyComponent = ({data, refetch}) => {

    const { zoneCode, addr, addrDetail } = useMemo(()=>{
        const addrResult = {};
        addrResult.zoneCode = data.addr.split("(")[1]?.split(")")[0] ?? "";
        addrResult.addr = data.addr.split(")")[1]?.split("(상세주소")[0] ?? data.addr
        addrResult.addrDetail = data.addr.split("(상세주소)")[1] ?? "";
        return addrResult;
    },[data])

    const [modData, setModData] = useState({role: data.role, state : data.state, penaltyDate : data.penaltyDate});

    

    const roleMap = {
            "정회원": "USER",
            "사서" : "MANAGER",
            "관리자" : "ADMIN",
        };
    const stateMap = {
            "일반계정": "NORMAL",
            "제재계정" : "OVERDUE",
            "정지계정" : "PUNISH",
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
            setModData(prev => ({
            ...prev,
            ["penaltyDate"] : ""
        }))
            return;
        }

        setModData(prev => ({
            ...prev,
            ["penaltyDate"] : e.target.value
        }))
    }

    const handleUpdate = () => {
        if(modData.state == "OVERDUE" && modData.penaltyDate == ""){
            alert("기한 설정을 해야합니다.");
            return;
        }

        const paramData = new FormData();
        paramData.append("mid", data.mid);
        paramData.append("role", modData.role);
        paramData.append("state", modData.state);
        
        if(modData.state == "OVERDUE"){
        paramData.append("penaltyDate", modData.penaltyDate);
        }

        postMemberManage(paramData).then(res => {
            alert("완료 되었습니다. 해당 회원에 대한 설정은 현재 시점 이후 로그인 시 적용됩니다.");
            refetch();
        }).catch(e => {
            alert("오류가 발생하였습니다.");
            console.error(e);
        })
        
    }



   

    return (<div className="ml-4">
    <div className = "font-bold mt-3 mb-8 text-xl">{`회원ID : ${data.mid} (${data.name})`} </div>
    <div className="flex items-center pb-3 mb-3 border-b border-b-gray-300">
    <span className="mr-5 font-bold">회원번호</span>
    {data.mno}
    </div>
    <div className="flex items-center pb-3 mb-3 border-b border-b-gray-300">
    <span className="mr-5 font-bold">생년월일 / 성별</span>
    {data.birthDate} / {data.gender}
    </div>
    <div className="flex items-center pb-3 mb-3 border-b border-b-gray-300">
    <span className="mr-5 font-bold">전화번호</span>
    <span className="mr-2">{data.phone}</span>
    {data.checkSms == "true" ? <span className="text-blue-600">(수신동의)</span> : <span className="text-red-600">(수신거부)</span>}
    </div>
    <div className="flex items-center pb-3 mb-3 border-b border-b-gray-300">
    <span className="mr-5 font-bold">이메일</span>
    <span className="mr-2">{data.email ?? ""}</span>
    {data.checkEmail == "true" ? <span className="text-blue-600">(수신동의)</span> : <span className="text-red-600">(수신거부)</span>}
    </div>
    <div className="flex items-center pb-3 mb-4 border-b border-b-gray-300">
    <span className="mr-5 font-bold">주소</span>
    {zoneCode && <>({zoneCode})<br /></>}  {addrDetail ? <>{addr},<br /></>: <>{addr}</>}{addrDetail}
    </div>
    <div className="flex items-center mb-4 z-40 relative">
    <span className="mr-5 font-bold">권한</span>
    <SelectComponent name="role" onChange={handleRole} value={modData.role}  options={roleMap} selectClassName="!w-30" dropdownClassName="!w-30" disabled={modData.state == "LEAVE"}/>
    </div>
    <div className="flex items-center z-30 relative">
    <span className="mr-5 font-bold">상태</span>
    {modData.state == "LEAVE" ? 
    <SelectComponent name="state" onChange={()=>{}} value={"탈퇴계정"}  options={[]} selectClassName="!w-31" dropdownClassName="!w-31" disabled={true}/>
    :<SelectComponent name="state" onChange={handleState} value={modData.state}  options={stateMap} selectClassName="!w-31" dropdownClassName="!w-31"/>
    }
    {(modData.state == "OVERDUE") ? <><input type="date" value={modData.penaltyDate} onChange={handlePenalty}
    className ="w-40 px-4 py-2 rounded-2xl bg-white border border-[#00893B] mr-3" /> 까지</>
    : <><input type="date" value={""}
    className ="w-40 px-4 py-2 rounded-2xl bg-gray-200 border border-gray-300 mr-3" disabled={true} /> 까지</>}
    </div>
    <div className="flex mt-10 mr-6 justify-center">
        {modData.state != "LEAVE" &&<Button onClick={handleUpdate}>적용</Button>}
    </div>
    
    </div>);
}

export default MemberModifyComponent;