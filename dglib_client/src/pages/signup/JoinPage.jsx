import DaumPostcode from 'react-daum-postcode';
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import Button from "../../components/common/Button";
import CheckBox from "../../components/common/CheckBox";
import IdCheckComponent from "../../components/member/IdCheckComponent";
import PwCheckComponent from "../../components/member/PwCheckComponent";
import PwEqualComponent from "../../components/member/PwEqualComponent";
import Modal from '../../components/common/Modal';
import { regPost } from '../../api/memberApi';
import { getKakaoEmail } from '../../api/kakaoApi';
import { useReactToPrint } from "react-to-print";



const JoinPage = () => {

const location = useLocation();
const [ searchURLParams, setSearchURLParams] = useSearchParams();
const navigate = useNavigate();
const { phone, kakaoToken } = location.state || {};
const [ isOpen, setIsOpen ] = useState(false);
const [ joinForm, setJoinForm] = useState(
  {id : "", pw1:"", pw2:"", name: "", phone : phone, emailId:"", emailAddr:"",
     zonecode: "", address:"", addrDetail:"",
    checkEmail: false, checkSms: false, birthDate : "", gender: ""
  });
const [ idCheck, setIdCheck ] = useState(false);
const [ pwCheck, setPwCheck ] = useState(false);
const [ pwEqual, setPwEqual ] = useState(false);
const contentRef = useRef(null);
const reactToPrintFn = useReactToPrint({ contentRef });


useEffect(()=>{
if(!joinForm.phone){
    alert("비정상적인 접근입니다.");
    navigate("/signup");
    }

},[]);

useEffect(() => {
if(searchURLParams.get("account") == "kakao"){
  if(kakaoToken){
    return;
    } else{
    alert("토큰이 존재하지않습니다. 카카오 인증을 다시 시도해주세요");
    navigate("/login",{replace : true});
  }

}
},[searchURLParams.toString()])

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
setJoinForm(prev => (
    {...prev,
        [e.target.name] : e.target.value
    }
)
)
};

const handleForm = (value, type) => {
switch(type){
  case "id":
  setIdCheck(value);
  return;
  case "pw1":
  setPwCheck(value);
  return;
  case "pw2":
  setPwEqual(value);
  return;
}
}

const onAddrCode = (data) => {
    onCloseAddr();
    setJoinForm(prev => (
    {...prev,
        ["address"] : data.address,
        ["zonecode"] : data.zonecode,
        ["addrDetail"] : ""
    }
  ));
  };

const handleSelect = (e) => {
setJoinForm(prev => (
    {...prev,
        ["emailAddr"] : e.target.value
    }
  ));
}

const handleCheck = (e, name) => {
  if(name == "checkEmail" && (joinForm.emailId=="" || joinForm.emailAddr == "")){
    alert("이메일을 제대로 입력하셔야 수신 여부 체크가 가능합니다.");
    return;
  }

setJoinForm(prev => (
    {...prev,
        [name] : e.target.checked
    }
  ));
}

const onClickAddr = () => {
 setIsOpen(true);
}

const onCloseAddr = () => {
  setIsOpen(false);
}

const toJsonParams = (data) => {
  const dataParams = {
        mid : data.id,
        pw : data.pw2,
        name : data.name,
        gender : data.gender,
        birthDate : data.birthDate,
        phone : data.phone,
        addr : `(${data.zonecode})${data.address}(상세주소)${data.addrDetail}`,
        email : `${data.emailId}@${data.emailAddr}`,
        checkSms : data.checkSms,
        checkEmail : data.checkEmail
        }

        if(!data.emailId){
          dataParams.email = null;
        }
        
    return dataParams;
    };

const regMember = async() => {

const params = toJsonParams(joinForm);

if(searchURLParams.get("account") == "kakao"){
const checkPost = await getKakaoEmail({"accessToken": kakaoToken})
  .then(res => {
    params.kakao = res;
    return true;
  })
  .catch(error => {
    console.error(error);
    if(error.response.data.message == "Expired Token"){
      const checkConfirm = confirm("토큰이 만료되어 카카오 계정 연동에 실패했습니다. 카카오 연동을 제외하고 현재 입력한 정보로 회원가입하시겠습니까?");
      return checkConfirm;
    } else{
      alert("회원 등록에 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  })

  if(!checkPost)
  return;
}

console.log(params);

regPost(params)
.then(res => {
  alert("회원 등록이 완료되었습니다. 로그인해주세요.");
  navigate("/login", { state: {}, replace: true });
  }).catch(error => {
    console.error(error)
    alert("회원 등록에 실패했습니다. 다시 시도해주세요.");});

}

const onClickJoin = () => {
  if(!(idCheck)){
  alert("아이디 중복 검사를 수행해주세요.");
  } else if(!(pwCheck && pwEqual)){
  alert("비밀번호가 형식에 맞지 않거나 일치하지 않습니다.");
  } else if(!(joinForm.name && joinForm.birthDate && joinForm.gender && joinForm.address && joinForm.zonecode)){
  alert("필수 입력 정보를 확인해주세요.");
  } else if(joinForm.emailId && !joinForm.emailAddr.includes(".")){
    alert("이메일 형식이 올바르지 않습니다.");
  }
  else{
    regMember(joinForm);
  }
}



return(
<Layout sideOn={false}>
<SubHeader subTitle="회원가입" mainTitle="기타" print={reactToPrintFn} />
<div className="max-w-3xl mx-auto mt-10 p-6 bg-white border rounded-lg shadow" ref={contentRef}>
  <h2 className="text-xl font-semibold border-b mb-6 pb-6">회원가입</h2>

  <form className="space-y-0 divide-y divide-gray-300" onSubmit={(e) => e.preventDefault()}>

    {/* 아이디 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        아이디<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex flex-1 items-center gap-2 px-4 py-2">
        <input name="id" type="text" placeholder="아이디" value={joinForm.id} className="border px-3 py-2 rounded" onChange={handleChange} />
        <IdCheckComponent id={joinForm.id} handleForm={handleForm} check={idCheck} />
        {kakaoToken && <CheckBox label = "카카오계정" checked={true} checkboxClassName="px-3 py-2 ml-2 font-semibold" inputClassName="accent-gray-300 w-4 h-4" onChange={()=>{}} />}
      </div>
    </div>

    {/* 비밀번호 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        비밀번호<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex px-4 py-2 items-center gap-2">
        <input name="pw1" type="password" placeholder="비밀번호" className="flex border px-3 py-2 rounded" onChange={handleChange} />
        <PwCheckComponent pw={joinForm.pw1} handleForm={handleForm} check={pwCheck}/>
      </div>
    </div>

    {/* 비밀번호 확인 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        비밀번호 확인<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex px-4 py-2 items-center gap-2">
        <input name="pw2" type="password" placeholder="비밀번호 확인" className="flex border px-3 py-2 rounded" onChange={handleChange}/>
        <PwEqualComponent pw1={joinForm.pw1} pw2={joinForm.pw2} handleForm={handleForm} check={pwEqual}/>
      </div>
    </div>

    {/* 성명 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        성명(한글)<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2">
        <input type="text" name="name" placeholder="성명" value = {joinForm.name} className="flex border px-3 py-2 rounded" onChange={handleChange} />
      </div>
    </div>

    {/* 생년월일/성별 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        생년월일 / 성별<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2 flex items-center gap-4">
        <input type="date" name= "birthDate"  value = {joinForm.birthDate} className="border px-3 py-2 rounded" onChange={handleChange} />
        <label className="flex items-center gap-1 text-sm">
          <input type="radio" name="gender" value={"남"} className="accent-green-600" onChange={handleChange} />
          남
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="radio" name="gender" value={"여"} className="accent-green-600" onChange={handleChange} />
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
        <input value={joinForm.phone} className="flex border px-3 py-2 rounded bg-blue-100" readOnly />
        <CheckBox label="SMS 수신 여부" checked={joinForm.checkSms} onChange={(e) => handleCheck(e, "checkSms")} />
      </div>
    </div>

    {/* 주소 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        주소<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        <div className="flex gap-2">
          <input type="text" value={joinForm.zonecode} placeholder="우편번호" className="flex border px-3 py-2 rounded bg-blue-100" readOnly />
          <Button className="bg-slate-700 hover:bg-slate-800" onClick={onClickAddr}>우편번호 찾기</Button>
        </div>
        <input type="text" value={joinForm.address} placeholder="기본주소" className="border px-3 py-2 rounded w-full bg-blue-100" readOnly />
        <input type="text" name='addrDetail' value = {joinForm.addrDetail} placeholder="상세주소" className="border px-3 py-2 rounded w-full" onChange={handleChange} />
      </div>
    </div>

    {/* 이메일 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        이메일
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        <div className="flex gap-2">
          <input type="text" name="emailId" value = {joinForm.emailId} placeholder="이메일 아이디" className="border px-3 py-2 rounded w-1/3" onChange={handleChange} />
          <span className="mt-2">@</span>
          <input type="text" name="emailAddr" value = {joinForm.emailAddr} placeholder="이메일 주소" className="border px-3 py-2 rounded w-1/3" onChange={handleChange} />
          <select className="border px-3 py-2 rounded" value = {joinForm.emailAddr} onChange={handleSelect}>
            <option value={""}>직접입력</option>
            <option value={"gmail.com"}>google</option>
            <option value={"naver.com"}>naver</option>
            <option value={"daum.net"}>daum</option>
          </select>
        </div>
        <CheckBox label="EMAIL 수신 여부" checked={joinForm.checkEmail} onChange ={(e) => handleCheck(e, "checkEmail")} />
      </div>
    </div>

    {/* 버튼 */}
    <div className="flex justify-center gap-4 py-6">
      <Button onClick={onClickJoin}>회원가입</Button>
      <Button className="bg-gray-400 hover:bg-gray-500" onClick={()=>navigate("/")}>취소</Button>
    </div>

  </form>
</div>
<Modal isOpen={isOpen} title={"주소찾기"} onClose={onCloseAddr}>
<DaumPostcode onComplete={onAddrCode} />
</Modal>
</Layout> 
);

}


export default JoinPage; 