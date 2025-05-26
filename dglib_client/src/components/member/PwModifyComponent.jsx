import { useState } from "react";
import PwCheckComponent from "./PwCheckComponent";
import PwEqualComponent from "./PwEqualComponent";
import Button from "../common/Button";

const PwModifyComponent = ({ handlePwMod }) => {
    const [ pwCheck, setPwCheck ] = useState(false);
    const [ pwEqual, setPwEqual ] = useState(false);
    const [ modPw, setModPw ] = useState({pw1: "", pw2 : ""});



    const handleClickMod = () => {
        if(!(pwCheck && pwEqual)){
            alert("비밀번호가 형식에 맞지 않거나 일치하지 않습니다.");
            return;
        }

        handlePwMod(modPw.pw1);
    }



        const handleChangePw = (e) => {
        setModPw (prev => ({
            ...prev,
            [e.target.name] : e.target.value
        }))
    }

        const handleForm = (value, type) => {
        switch(type){
        case "pw1":
        setPwCheck(value);
        return;
        case "pw2":
        setPwEqual(value);
        return;
        }
        }

    return (<>
                    <div className = "grid grid-cols-5 justify-center items-center my-10 w-100 mx-auto gap-1">
                    <div className = "col-span-5 font-bold my-10 text-center">비밀번호 재설정</div>
                     <label className="col-span-2">비밀번호 설정</label>
                        <input type="password" name={"pw1"} value={modPw.pw1} onChange={handleChangePw} className = "col-span-2 border rounded w-30" />
                        <PwCheckComponent pw={modPw.pw1} handleForm={handleForm} check={pwCheck}/>
                         <label className="col-span-2">비밀번호 확인</label>
                        <input type="password" name={"pw2"} value={modPw.pw2} onChange={handleChangePw} className = "col-span-2 border rounded w-30" />
                        <PwEqualComponent pw1={modPw.pw1} pw2={modPw.pw2} handleForm={handleForm} check={pwEqual}/>
                        </div>
                        <div className="flex justify-center">
                        <Button onClick ={handleClickMod}>비밀번호 변경</Button></div>
                        </>
    );

}

export default PwModifyComponent;