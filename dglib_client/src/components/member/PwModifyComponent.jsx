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
                    <div className = "justify-center items-center my-1 w-100 mx-auto gap-1">
                    <div className = "mt-3 mb-7 text-center font-bold">비밀번호 재설정</div>
                        <div className="flex justify-center">
                        <input type="password" name={"pw1"} value={modPw.pw1} onChange={handleChangePw} placeholder="비밀번호를 입력하세요."
                        className = "border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-500 w-60" />
                        </div>
                        <div className="flex justify-center h-10 pl-10">
                        <PwCheckComponent pw={modPw.pw1} handleForm={handleForm} check={pwCheck}/></div>
                        <div className="flex justify-center mt-3">
                        <input type="password" name={"pw2"} value={modPw.pw2} onChange={handleChangePw} placeholder="비밀번호를 다시 입력하세요."
                        className = "border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-500 w-60" />
                        </div>
                        <div className="flex justify-center h-10 pl-10">
                        <PwEqualComponent pw1={modPw.pw1} pw2={modPw.pw2} handleForm={handleForm} check={pwEqual}/>
                        </div>
                        <div className="flex justify-center">
                        <Button onClick ={handleClickMod}>비밀번호 변경</Button></div>
                        </div>
                        </>
    );

}

export default PwModifyComponent;