import Button from "../common/Button";
import { useState, useRef, useEffect, memo, useCallback } from "react";

const PhoneAuthComponent = ({ handlePage }) => {

    const [ phoneNum, setPhoneNum ] = useState({first:"010", second:"", third:""});
    const inputStyle = "border rounded w-15 h-9 mx-1 py-1 text-center"
    const phoneFirstArr = ["010","011","016","017","018","019"]
    const phoneRef = { second : useRef(), third : useRef() };

    useEffect(()=>{
        phoneRef.second.current.focus();
    }
    ,[]);

    const handleChange = (e) => {
        if (/[^0-9]/.test(e.target.value)) return;

        setPhoneNum(prev =>
        ({...prev, [e.target.name] : e.target.value})
        );
        if(e.target.name == "first")
            phoneRef.second.current.focus();

        if(e.target.name =="second" && e.target.value.length == 4){
            phoneRef.third.current.focus();
        }
    };

    const handleClick = useCallback(() => {
        if(phoneNum.second.length >= 3 && phoneNum.third.length >=4){
        const fullNumber = `${phoneNum.first}-${phoneNum.second}-${phoneNum.third}`;
        confirm(`${fullNumber}로 문자를 전송하시겠습니까?`)
        && handlePage("phoneCheck", {phoneNum : fullNumber});
        } else
        alert("휴대전화 번호를 제대로 입력했는지 확인해주세요.");
    },[phoneNum]);

    return (<>
    <div className="my-5 flex justify-center">본인인증할 휴대폰 번호를 입력하세오.</div>
    <div className="mb-7 text-lg flex items-center justify-center">
    <div className="text-2xl mr-2 pb-1">📱</div>
    <select name="first" className = {inputStyle} value={phoneNum.first} onChange={handleChange}>
    {phoneFirstArr.map(num => (<option key={num} value={num}>{num}</option>))}
    </select>-
    <input name="second" ref={phoneRef.second} className = {inputStyle} maxLength={4} autoComplete="off" value={phoneNum.second} onChange={handleChange} />- 
    <input name="third" ref={phoneRef.third} className = {inputStyle} maxLength={4} autoComplete="off" value={phoneNum.third} onChange={handleChange} />
    </div>
    <div className="flex justify-center">
    <Button onClick={handleClick}>인증코드 받기</Button>
    </div>
    
    </>);
}

export default PhoneAuthComponent;