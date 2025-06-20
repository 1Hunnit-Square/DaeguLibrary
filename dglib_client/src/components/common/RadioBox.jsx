import { useState } from "react";

const RadioBox = ({className = "", list, value= null, onChange}) => {

    const [ check, setCheck ] = useState("");

    const handleChange = (e) =>{
    setCheck(e);
    onChange(e);
    }


    return(
                <div className="flex gap-3">
                {Array.isArray(list) && list.map((radio, index) => 
                 <label key={index} className="flex gap-1.5 items-center">
                <input type="radio" className={`w-4 h-4 accent-green-700 ${className}`} checked={radio == (value ?? check)} onChange={()=>handleChange(radio)} />{radio}</label>    
                )
                }
                {!Array.isArray(list) && Object.keys(list).map((key, index) => 
                 <label key={index} className="flex gap-1.5 items-center">
                <input type="radio" className={`w-4 h-4 accent-green-700 ${className}`} checked={list[key] == (value ?? check)} onChange={()=>handleChange(list[key])} />{key}</label>    
                )
                }
                </div>


    );
}

export default RadioBox;