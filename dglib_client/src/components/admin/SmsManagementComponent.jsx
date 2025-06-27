import { delTemplate, findTemplate, getTemplate, regTemplate, sendSms } from "../../api/smsApi";
import Button from "../common/Button";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../routers/Loading";
import SmsSendListComponent from "./SmsSendListComponent";

const SmsManagementComponent = () =>{
    const [ content, setContent ] = useState("");
    const [ page, setPage ] = useState(1);
    const [ select, setSelect ] = useState("");
    const [ numList, setNumList] = useState([]);

     const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['templateList', page],
    queryFn: () => getTemplate({page: page, size: 10})
    });


    const getByteLength = useCallback((str) => {
    return new Blob([str]).size;
    },[content]);


  const cutStrSize = (str, maxUnits) => {
    let result = '';
    let units = 0;

    for (const char of str) {
        const isWide = /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(char);
        const charWidth = isWide ? 2 : 1;

        if (units + charWidth > maxUnits) break;
        result += char;
        units += charWidth;
    }

    return str == result ? str : result + " ...";
    }

    const handleChange = (e) => {
        if(getByteLength(e.target.value) <= 2000){
        setContent(e.target.value);
        } else{
        return;
        }
    }

    const handleSelect = (e) => {
        setSelect(e.target.value);

        if(e.target.value == ""){
            setContent("");
            return;
        }

        findTemplate({id : e.target.value})
        .then(res=> setContent(res))
        .catch(error => {
                console.error(error);
                alert("템플릿을 불러오는데 실패하였습니다.");
            })

    }


    const handleSave = () => {
        if(!content){
            alert("내용을 입력해주세요");
            return;
        }
    const param = new FormData();
    param.append("content",content);
    regTemplate(param).then(res => {
        alert("템플릿을 저장하였습니다.");
        refetch();
        setSelect(res);
    }).catch(error => {
        console.error(error);
        alert("저장에 실패하였습니다.");
    })

    }

    const handlePage = (page, total) => {
        if(page < 1 || page > total)
            return;
        setSelect("");
        setPage(page);
    }

    const handleDelete = () => {
        if(select){
        if(!confirm("템플릿을 삭제하시겠습니까?")){
            return;
        }

        const param = new FormData();
        param.append("id",select);
        delTemplate(param).then(res =>{
            alert("템플릿이 삭제되었습니다.");
            setSelect("");
            setContent("");
            refetch();
        }).catch(error => {
            console.error(error);
            alert("삭제에 실패하였습니다.");
            })
        } else {
            alert("템플릿을 선택해주세요");
        }
    }

    const handleToSend = () => {
        const checkConfirm = confirm("문자를 전송하시겠습니까?");

        if(!checkConfirm){
            return;
        }
        
        if(numList?.length == 0){
            alert("수신자 명단에 번호가 없습니다.");
            return;
        }

        if(!content){
            alert("문자 내용을 입력해주세요");
            return;
        }

        const paramData = new FormData();
        numList.forEach(phone => 
            paramData.append("phoneList",phone)
        )
        paramData.append("message", content);
        
        sendSms(paramData).then(res => {
            alert("문자를 성공적으로 전송하였습니다.");

        }).catch(error => {
            console.error(error);
            alert("문자 발신에 오류가 있습니다.");
        })

       
    }

    return(<>
         <h1 className="text-3xl font-bold mt-7 mb-1 text-center text-[#00893B]">SMS 발신 서비스</h1>
        <div className = "flex gap-20 m-10 p-20 justify-center border-1 border-gray-100 shadow-sm rounded-2xl w-fit mx-auto">
            <div className="w-80 h-130 border border-gray-400 rounded-4xl bg-white shadow-lg flex flex-col px-5 justify-center items-center">
            <div className = "bg-black rounded h-2 w-25 my-5"></div>
            <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-gray-200 w-full mb-10">
            <textarea className="border border-gray-200 p-5 bg-white w-full h-70 resize-none outline-blue-300" value ={content} placeholder="문자를 입력해주세요."
                onChange={handleChange} />
                <div className ="flex justify-between mt-2">
                    <div className ="text-xs ml-1">{getByteLength(content)} / 2000 Bytes</div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className = "text-sm bg-blue-500 hover:bg-blue-600 !p-1.5">템플릿 저장</Button>
                        <Button onClick={handleToSend} className = "text-sm !p-1.5">전송</Button>
                    </div>
                </div>
            <div className = "mt-5 px-3 flex justify-center items-center gap-2">
                {isLoading && <Loading />}
                
                <select className = "w-50 border rounded p-1 bg-white text-sm" onChange={handleSelect} value={select} >
                <option value = "">템플릿을 선택해주세요</option>
                {data && data.content.map((template, index) => 
                <option key ={index} value={template.templateId}>{cutStrSize(template.content,20)}</option>
                ) }
                </select>
                <div onClick={handleDelete} className ="bg-red-400 text-white px-2 py-1 rounded text-sm font-bold hover:bg-red-500 cursor-pointer">X</div>
            </div>
            <div className ="text-center mt-2">
            {data && <>
            <span onClick={()=> handlePage(page-1, data.totalPages)} className="px-2 cursor-pointer hover:text-green-800">{"<"}</span>
            {page} / {data.totalPages}
            <span onClick={()=> handlePage(page+1, data.totalPages)} className="px-2 cursor-pointer hover:text-green-800">{">"}</span>
            </>}
            </div>
            </div>
            </div>
            <SmsSendListComponent numList={numList} setNumList={setNumList} />
            </div>
            </>
    );
}

export default SmsManagementComponent;