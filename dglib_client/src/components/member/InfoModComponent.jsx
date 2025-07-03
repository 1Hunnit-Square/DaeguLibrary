import CheckBox from "../common/CheckBox";
import Button from "../common/Button";
import { useState, useMemo } from "react";
import DaumPostcode from "react-daum-postcode";
import Modal from "../common/Modal";
import { useNavigate } from "react-router-dom";
import PwModifyComponent from "./PwModifyComponent";
import PhoneAuthComponent from "./PhoneAuthComponent";
import PhoneCheckComponent from "./PhoneCheckComponent";
import PageModal from "../common/PageModal";
import { modPost } from "../../api/memberApi";

const InfoModComponent = ({data, handleSuccess}) => {
    const memberInfo = useMemo(()=>{
    return {
        pw : data.pw,
        name : data.name,
        birthDate : data.birthDate,
        gender : data.gender,
        phone : data.phone,
        checkSms : data.checkSms,
        checkEmail : data.checkEmail,
        zonecode : data.addr.split("(")[1]?.split(")")[0] ?? "",
        address : data.addr.split(")")[1]?.split("(상세주소")[0] ?? data.addr,
        addrDetail : data.addr.split("(상세주소)")[1] ?? "",
        emailId : data.email?.split("@")[0] ?? "",
        emailAddr : data.email?.split("@")[1] ?? ""
    }
    },[]);
    const [ isOpen, setIsOpen ] = useState({addr : false, modPw : false, modPhone : false});
    const [ form, setForm ] = useState(memberInfo);
    const navigate = useNavigate();


    const onClickModal = (e) => {
    setIsOpen(prev => ({
        ...prev,
        [e] : true
    }));
    }

    const onCloseModal = (e) => {
       setIsOpen(prev => ({
        ...prev,
        [e] : false
    }));
    }

    const onAddrCode = (data) => {
    onCloseModal("addr");
    setForm(prev => (
    {...prev,
        ["address"] : data.address,
        ["zonecode"] : data.zonecode,
        ["addrDetail"] : ""
    }
  ));
  };


    const handleSelect = (e) => {
    setForm(prev => (
    {...prev,
        ["emailAddr"] : e.target.value
        }
    ));
    }

    const handleCheck = (e, name) => {
    if(name == "checkEmail" && (form.emailId=="" || form.emailAddr == "")){
        alert("이메일을 제대로 입력하셔야 수신 여부 체크가 가능합니다.");
        return;
    }

    setForm(prev => (
        {...prev,
            [name] : e.target.checked
        }
    ));
    }

    const handleChange = (e) => {
    if(e.target.name == "birthDate" && new Date(e.target.value) > new Date() ){
    alert("현재 날짜보다 이전 날짜로 선택해주세요.");
    return;
    }

    if(e.target.name == "name" && (e.target.value.length >=7 || !/^[ㄱ-ㅎ가-힣]*$/.test(e.target.value))){
    alert("성명은 한글만 입력 가능합니다.");
    return;
    }

    if((e.target.name == "emailId" || e.target.name =="emailAddr") && (/[@ ]/.test(e.target.value))){
    return;
    }
    setForm(prev => (
        {...prev,
            [e.target.name] : e.target.value
        }
    )
    )
    };

    const handlePwMod = (value) => {
        setForm(prev =>({
            ...prev,
            ["pw"] : value 
        }))

        onCloseModal("modPw")
    }

    const handlePhoneMod = (value) => {
      setForm(prev =>({
            ...prev,
            ["phone"] : value.phone
        }))
        onCloseModal("modPhone")
    }

    const PageMap = {
    phoneAuth : { component : PhoneAuthComponent},
    phoneCheck : { component : PhoneCheckComponent, props : { handleSuccess : handlePhoneMod, phoneCheck : false } }
    }


    const toJsonParams = (param) => {
      const dataParams = {
            mid : data.mid,
            name : param.name,
            gender : param.gender,
            birthDate : param.birthDate,
            phone : param.phone,
            addr : `(${param.zonecode})${param.address}(상세주소)${param.addrDetail}`,
            email : `${param.emailId}@${param.emailAddr}`,
            checkSms : param.checkSms,
            checkEmail : param.checkEmail
            }
        if(param.pw != data.pw){
          dataParams.pw =param.pw;
        }

         if(!param.emailId){
         dataParams.email = null;
        }
        return dataParams;
        }
    
    const modMember = (form) => {
      const params = toJsonParams(form);
    modPost(params)
    .then(res => {
      handleSuccess();
      
      }).catch(e => {
        if(e.response?.data.message == "ID Different"){
          alert("접속 상태가 올바르지 않습니다. 다시 로그인해주세요.");
          return;
        }
        console.error(e);  
        alert("회원 수정에 실패했습니다. 다시 시도해주세요.");
      });
    }
    
    const onClickModify = () => {
      if(!(form.name && form.birthDate && form.gender && form.address && form.zonecode)){
      alert("필수 입력 정보를 확인해주세요.");
      } else if(form.emailId && !form.emailAddr.includes(".")){
        alert("이메일 형식이 올바르지 않습니다.");
      } else{
        console.log(form);
        modMember(form);
      }
    }

    const handleClickLeave = () => {
      window.leaveMid = data.mid;
      window.open(`/leave`, "_blank", "width=1000,height=700");
    
    }

    return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white border rounded-lg shadow">
      <h2 className="text-xl font-semibold border-b mb-6 pb-6">정보수정</h2>
    
      <form className="space-y-0 divide-y divide-gray-300" onSubmit={(e) => e.preventDefault()}>
    
        {/* 아이디 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            아이디<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex flex-1 items-center gap-2 px-4 py-2">
            <input name="id" type="text" placeholder="아이디" value={data.mid} className="bg-blue-100 border px-3 py-2 rounded" readOnly />
            {data?.kakao && <CheckBox label = "카카오계정" checked={true} checkboxClassName="px-3 py-2 font-semibold" inputClassName="accent-gray-300 w-4 h-4" onChange={()=>{}} />}
          </div>
        </div>
    
        {/* 비밀번호 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            비밀번호<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex px-4 py-2 items-center gap-2">
            <input name="pw1" value={form.pw} type="password" placeholder="비밀번호" className="bg-blue-100 flex border px-3 py-2 rounded" readOnly />
             {data.pw == form.pw? <Button className="bg-slate-700 hover:bg-slate-800" onClick={()=>onClickModal("modPw")}>변경</Button>
            : <Button className="bg-blue-400 hover:bg-blue-500" onClick={()=>onClickModal("modPw")}>변경됨</Button>}
          </div>
        </div>
    
        {/* 성명 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            성명(한글)<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex-1 px-4 py-2">
            <input type="text" name="name" placeholder="성명" value = {form.name} className="flex border px-3 py-2 rounded" onChange={handleChange} />
          </div>
        </div>
    
        {/* 생년월일/성별 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            생년월일 / 성별<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex-1 px-4 py-2 flex items-center gap-4">
            <input type="date" name= "birthDate"  value = {form.birthDate} className="border px-3 py-2 rounded" onChange={handleChange} />
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="gender" value={"남"} className="accent-green-600" onChange={handleChange} checked ={(form.gender == "남")} />
              남
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="gender" value={"여"} className="accent-green-600" onChange={handleChange} checked = {(form.gender == "여")} />
              여
            </label>
          </div>
        </div>
    
        {/* 휴대폰 번호 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            휴대폰 번호<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex-1 px-4 py-2 space-y-2">
            <div className="flex gap-2">
            <input value={form.phone} className="flex border px-3 py-2 rounded bg-blue-100" readOnly />
            {data.phone == form.phone? <Button className="bg-slate-700 hover:bg-slate-800" onClick={()=>onClickModal("modPhone")}>변경</Button>
            : <Button className="bg-blue-400 hover:bg-blue-500" onClick={()=>onClickModal("modPhone")}>변경됨</Button>}</div>
            <CheckBox label="SMS 수신 여부" checked={form.checkSms} onChange={(e) => handleCheck(e, "checkSms")} />
          </div>
        </div>
    
        {/* 주소 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            주소<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="flex-1 px-4 py-2 space-y-2">
            <div className="flex gap-2">
              <input type="text" value={form.zonecode} placeholder="우편번호" className="flex border px-3 py-2 rounded bg-blue-100" readOnly />
              <Button className="bg-slate-700 hover:bg-slate-800" onClick={()=>onClickModal("addr")}>우편번호 찾기</Button>
            </div>
            <input type="text" value={form.address} placeholder="기본주소" className="border px-3 py-2 rounded w-full bg-blue-100" readOnly />
            <input type="text" name='addrDetail' value = {form.addrDetail} placeholder="상세주소" className="border px-3 py-2 rounded w-full" onChange={handleChange} />
          </div>
        </div>
    
        {/* 이메일 */}
        <div className="flex">
          <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
            이메일
          </div>
          <div className="flex-1 px-4 py-2 space-y-2">
            <div className="flex gap-2">
              <input type="text" name="emailId" value = {form.emailId} placeholder="이메일 아이디" className="border px-3 py-2 rounded w-1/3" onChange={handleChange} />
              <span className="mt-2">@</span>
              <input type="text" name="emailAddr" value = {form.emailAddr} placeholder="이메일 주소" className="border px-3 py-2 rounded w-1/3" onChange={handleChange} />
              <select className="border px-3 py-2 rounded" value = {form.emailAddr} onChange={handleSelect}>
                <option value={""}>직접입력</option>
                <option value={"gmail.com"}>google</option>
                <option value={"naver.com"}>naver</option>
                <option value={"daum.net"}>daum</option>
              </select>
            </div>
            <CheckBox label="EMAIL 수신 여부" checked={form.checkEmail} onChange ={(e) => handleCheck(e, "checkEmail")} />
          </div>
        </div>
    
        {/* 버튼 */}
        <div className="flex justify-center gap-4 py-6">
          <Button onClick={handleClickLeave} className="bg-red-500 hover:bg-red-600">회원탈퇴</Button>
          <Button onClick={onClickModify}>정보수정</Button>
          <Button className="bg-gray-400 hover:bg-gray-500" onClick={()=>navigate("/")}>취소</Button>
        </div>
      
      </form>
      <Modal isOpen={isOpen.addr} title={"주소찾기"} onClose={()=>onCloseModal("addr")}><DaumPostcode onComplete={onAddrCode} /></Modal>
      <Modal isOpen={isOpen.modPw} title={"비밀번호 변경"} onClose={()=>onCloseModal("modPw")}><PwModifyComponent handlePwMod={handlePwMod} /></Modal>
      <PageModal isOpen={isOpen.modPhone} title={"휴대폰 변경"} onClose={()=>onCloseModal("modPhone")} PageMap={PageMap} defaultPage={"phoneAuth"} />
      </div>
      
    );
}
export default InfoModComponent;