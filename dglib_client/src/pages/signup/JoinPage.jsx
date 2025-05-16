import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import SubHeader from "../../layouts/SubHeader";
import Button from "../../components/common/Button";
import CheckBox from "../../components/common/CheckBox";
import IdCheckComponent from "../../components/member/IdCheckComponent";

const JoinPage = () => {

const location = useLocation();
const navigate = useNavigate();
const { phone } = location.state || {};
const [ joinForm, setJoinForm] = useState({id : "", phone : phone});
const [ idCheck, setIdCheck ] = useState(false);

useEffect(()=>{
if(!joinForm.phone){
    alert("비정상적인 접근입니다.");
    navigate("/signup");
    }

},[]);

const handleChange = (e) => {
setJoinForm(prev => (
    {...prev,
        [e.target.name] : e.target.value
    }
)
)
};

const handleForm = (value) => {
setIdCheck(value);
}

return(
<Layout sideOn={false}>
<SubHeader subTitle="회원가입" mainTitle="기타" />
<div className="max-w-3xl mx-auto mt-10 p-6 bg-white border rounded-lg shadow">
  <h2 className="text-xl font-semibold border-b mb-6 pb-6">회원가입</h2>

  <form className="space-y-0 divide-y divide-gray-300" onSubmit={(e) => e.preventDefault()}>

    {/* 아이디 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        아이디<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex flex-1 items-center gap-2 px-4 py-2">
        <input name="id" type="text" value={joinForm.id} className="border px-3 py-2 rounded" onChange={handleChange} />
        <IdCheckComponent id={joinForm.id} handleForm={handleForm} check={idCheck} />
      </div>
    </div>

    {/* 비밀번호 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        비밀번호<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2">
        <input type="password" className="flex border px-3 py-2 rounded" />
      </div>
    </div>

    {/* 비밀번호 확인 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        비밀번호 확인<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2">
        <input type="password" className="flex border px-3 py-2 rounded" />
      </div>
    </div>

    {/* 성명 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        성명<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2">
        <input type="text" className="flex border px-3 py-2 rounded" />
      </div>
    </div>

    {/* 생년월일/성별 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        생년월일 / 성별<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2 flex items-center gap-4">
        <input type="date" className="border px-3 py-2 rounded" />
        <label className="flex items-center gap-1 text-sm">
          <input type="radio" name="gender" className="accent-green-600" />
          남
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="radio" name="gender" className="accent-green-600" />
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
        <CheckBox label="SMS 수신 여부" />
      </div>
    </div>

    {/* 주소 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        주소<span className="text-red-500 ml-1">*</span>
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        <div className="flex gap-2">
          <input type="text" placeholder="우편번호" className="flex border px-3 py-2 rounded" />
          <Button>우편번호 찾기</Button>
        </div>
        <input type="text" placeholder="기본주소" className="border px-3 py-2 rounded w-full" />
        <input type="text" placeholder="상세주소" className="border px-3 py-2 rounded w-full" />
      </div>
    </div>

    {/* 이메일 */}
    <div className="flex">
      <div className="w-48 bg-gray-100 text-sm font-medium text-right px-4 py-3 border-r border-gray-300">
        이메일
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        <div className="flex gap-2">
          <input type="text" className="border px-3 py-2 rounded w-1/3" />
          <span className="mt-2">@</span>
          <input type="text" className="border px-3 py-2 rounded w-1/3" />
          <select className="border px-3 py-2 rounded">
            <option>직접입력</option>
            <option>gmail.com</option>
            <option>naver.com</option>
          </select>
        </div>
        <CheckBox label="EMAIL 수신 여부" />
      </div>
    </div>

    {/* 버튼 */}
    <div className="flex justify-center gap-4 py-6">
      <Button className="bg-red-500 hover:bg-red-600">회원가입</Button>
      <Button className="bg-gray-400 hover:bg-gray-500">취소</Button>
    </div>

  </form>
</div>

</Layout> 
);

}


export default JoinPage; 