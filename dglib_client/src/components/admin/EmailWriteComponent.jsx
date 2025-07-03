import MailQuillComponent from "../common/MailQuillComponent";
import { useRecoilValue } from "recoil";
import { memberRoleSelector } from "../../atoms/loginState";
import { useEffect, useState, useMemo } from "react";
import { sendMailPost } from "../../api/mailApi";
import { API_ENDPOINTS, ORIGIN_URL } from "../../api/config";
import Modal from "../common/Modal";
import CheckNonLabel from "../common/CheckNonLabel";
import _ from "lodash";
import { useMutation } from "@tanstack/react-query";
import Button from "../common/Button";
import RadioBox from "../common/RadioBox";
import { getEmailInfoList } from "../../api/memberApi";
import Loading from "../../routers/Loading";
import Scrollbars from "react-custom-scrollbars-2";
import { useSearchParams } from "react-router-dom";
import { getMailDetail } from "../../api/mailApi";
import { emailReplace } from "../../util/commonUtil";

const EmailWriteComponent = () =>{

    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const [ isOpen, setIsOpen ] = useState(false);
    const [ mailList, setMailList ] = useState([]);
    const [ nameList, setNameList ] = useState([]);
    const [ searchResults, setSearchResults ] = useState([]);
    const [ searchKey, setSearchKey ] = useState({type:"전체"});
    const [ addkey, setAddkey ] = useState(()=>{});
    const [ readLoading, setReadLoading ] = useState(false);
    const [ useForm, setUseForm ] = useState({});

    const role = useRecoilValue(memberRoleSelector);

    const sendParams = (paramData, set) => {


    paramData.append("trackPath", `${ORIGIN_URL}${API_ENDPOINTS.mail}/readMail/`);
    sendMailPost(paramData)
    .then(res => {
        alert("메일 전송을 완료였습니다.");
        window.opener.postMessage({reload : true},"*")
        window.close();

    }).catch(error => {
        console.error(error)
        alert("메일 전송에 오류가 있습니다.");
    }).finally(()=> {
        set.setSending(false);
    })
    }

    const onBack = () => {
    window.close();
    }


    useEffect(()=> {
        if(role != "ADMIN"){
            alert("권한이 없습니다.");
            window.close();
            return;
        }
            if(searchURLParams.get("sendType") && searchURLParams.get("eid")){
            setReadLoading(true);
            getMailDetail(searchURLParams.get("eid"), { mailType : "RECIEVER"})
                    .then(res => {
                        setUseForm({ ...res, content: emailReplace(res?.content, true), sendType: searchURLParams.get("sendType")});
                    }).catch(error =>{
                        console.error(error);
                        alert("해당하는 기능을 로드하는데 오류가 발생하였습니다.")

                    }).finally(()=>{
                        setReadLoading(false);
                    });
            }

        },[])


    const searchMutation = useMutation({
        mutationFn: (memberNumber) => getEmailInfoList(memberNumber)
        ,
        onSuccess: (res) => {
            console.log(res);
            setMailList([]);
            setSearchResults(res);
            
        },
        onError: (error) => {
            console.log("회원 검색 오류:", error);
            alert("회원 검색에 실패했습니다. " + error.response?.data?.message);
        }
    });

    const handleSearchList = (set) => {
        setIsOpen(true)
        setAddkey(set);
    }

         const emailCheckTo = (value) => {
            return value == "true" ? <span className="text-blue-500">수신동의</span> : <span className="text-red-500">수신거부</span>
        }


        const checkMailExist = (email) => {
            if(email?.split("@")[0]?.trim() && email?.split("@")[1]?.trim()){
                return true;
            }
            return false;
        }
    
        const handleAllClick = (e)=> {
            if(searchResults?.length){
                if(allCheck){
                setMailList([]);
                setNameList([]);
                } else{
               const filterResults = searchResults.filter(v => checkMailExist(v.email));
                setMailList(filterResults.map(v => v.email));
                setNameList(filterResults.map(v => v.name))
                }
            }
        }

            const allCheck = useMemo(() => {
                    if(searchResults?.length){
                        const emailList = _.uniq(searchResults.filter(v => checkMailExist(v.email)).map(v => v.email));
                    return (_.isEqual(emailList, mailList));
                    }
                },[mailList]);

            const handleSearch = (e) => {
                setSearchKey(prev => ({
                    ...prev,
                    ["query"] : e.target.value
                }));
            }

            const handleRadio = (value) => {
                console.log(value);
                   setSearchKey(prev => ({
                    ...prev,
                    ["type"] : value
                }));
            }

            const ClickSearch = () =>{
                const paramData = {
                    query : searchKey.query,
                    option : "이름",
                    };
                paramData.checkEmail = (searchKey.type == "수신동의")


                searchMutation.mutate(paramData);
            }


        const handleAddList = (e, email, name)=> {
            if(e.target.checked){

            setMailList(prev => [...prev, email]);
            setNameList(prev => [...prev, name]);

            } else {
            setMailList(prev => {
                const updated = prev.filter(v => v != email);
                return updated;
            })
            setNameList(prev => {
                const updated = prev.filter(v => v != name);
                return updated;
            })
            }

        }

        const handleMailAdd = () => {
            addkey.setToEmail( prev => {
             const filterList = prev.map(mail => {
                    if(mail?.split("<")[1]?.split(">")[0]){
                        return mail.split("<")[1].split(">")[0];
                    } else
                    return mail;
                })
            const oldList = prev.filter((mail, i) =>
                    !mailList.includes(filterList[i])
                );
            
            const newList = mailList.map((v, i) => nameList[i] + " <"+v+">");
            return [ ...oldList, ...newList];
            });
            
            setAddkey(()=>{});
            setIsOpen(false);
            setMailList([]);
            setNameList([]);
        }

    
return(<div className = "flex flex-col items-center mb-10">
    {readLoading && <Loading />}
    {(role == "ADMIN") &&<MailQuillComponent onParams={sendParams} onBack={onBack} searchHandler={handleSearchList} useForm={useForm} />}
    <Modal isOpen={isOpen} title={"이메일 검색"} onClose={()=>setIsOpen(false)} className={"!max-w-4xl"}>
        <div className = "flex flex-col max-h-200 my-1 gap-5">
         <div className="flex flex-col gap-5 bg-gray-100 px-10 py-5 items-center">
                         
            <div className="flex gap-3 rounded">
                <span className = "font-bold">검색 유형을 선택하세요</span>
                <RadioBox list={["전체","수신동의"]} onChange={handleRadio} value={searchKey.type}/>
                </div>
                    <div className="flex gap-3 h-10">
                            <input
                             type="text"
                             placeholder="이름을 입력하세요"
                             className="p-2 w-70 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00893B]"
                             value={searchKey.query}
                             onChange={handleSearch}
                             onKeyDown={(e) => {if (e.key === 'Enter' && !searchMutation.isPending) {e.preventDefault(); ClickSearch();}}}
                         />
                         <Button
                             onClick={ClickSearch}
                             disabled={searchMutation.isPending}
                             children="검색"
                             className="w-15 !px-1"
                         />
                         </div>
            </div>
        <div className={`min-w-200 shadow-md rounded-t-lg overflow-x-hidden ${!searchMutation.isIdle ? "rounded-b-lg" : ""}`}>
        <Scrollbars autoHeight autoHeightMax={400} >
       <table className="w-full bg-white">
                    <thead className="bg-[#00893B] text-white sticky top-0 z-50">
                        <tr>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap"><CheckNonLabel onChange={handleAllClick} checked={allCheck} checkboxClassName="mx-auto" inputClassName="w-4 h-4" /></th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">회원ID</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">이름</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">이메일</th>
                            <th className="py-3 px-3 text-center text-sm uppercase whitespace-nowrap">수신동의</th>

                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {searchMutation.isPending && <Loading />}
                        {!searchMutation.isIdle && searchResults?.length === 0? (
                            <tr>
                                <td colSpan="10" className="py-10 px-6 text-center text-gray-500 text-xl">
                                   회원 정보를 불러올 수 없습니다.
                                </td>
                            </tr>
                        ) : (
                            searchResults && searchResults.map((item, index) => {

                                return (
                                    <tr key={index} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200`}>
                                        <td className="py-4 px-3 whitespace-nowrap text-center"><CheckNonLabel onChange={(e) => handleAddList(e, item.email, item.name)} checked={mailList.includes(item.email)}
                                        checkboxClassName="mx-auto" inputClassName="w-4 h-4" disabled={!checkMailExist(item.email)} /></td>
                                        <td className="py-4 px-3 max-w-20 min-w-20 whitespace-nowrap text-center">{item.mid}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.name}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-center">{item.email}</td>
                                         <td className="py-4 px-3 whitespace-nowrap text-center">{emailCheckTo(item.checkEmail)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    
                </table>
               </Scrollbars>
               </div>
           
            <div className="flex justify-end items-center gap-3">
            <Button onClick={handleMailAdd} className={"disabled:bg-[#82c8a0] disabled:cursor-not-allowed"} disabled={mailList?.length == 0} >메일 추가</Button>
            </div>
            </div>
    </Modal>
</div>
)

}

export default EmailWriteComponent;