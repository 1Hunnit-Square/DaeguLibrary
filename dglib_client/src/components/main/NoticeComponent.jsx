import { useQuery } from "@tanstack/react-query";
import { getNoticeTopList } from "../../api/noticeApi";
import { useNavigate } from "react-router-dom";

const NoticeComponent = () => {

 const { data: TopList } = useQuery({
  queryKey: ['noticeTopList'],
  queryFn: () => getNoticeTopList({count : 4}) 
    });

const navigate = useNavigate();

const toDate = (dateTime) => {
        return dateTime.substring(0, 10);
    }

    return(<div className="px-5">
    <table className="table-fixed w-full">
        <tbody>
    { Array.isArray(TopList) && TopList.length !== 0 && TopList.map((data, index) => {
        return (
        <tr key = {index} onClick={()=> navigate(`/community/notice/${data.ano}`)} className="cursor-pointer hover:text-green-700">
        <td className="w-3 py-1 px-1">
            <span className="inline-block w-1.5 h-1.5 bg-green-700 rounded-full mb-0.5"></span>
            </td>
        <td className="py-1 px-3 whitespace-nowrap text-left hover:underline truncate">{data.title}</td>
        <td className="w-32 py-1 px-3 text-right">{toDate(data.postedAt)}</td>
        </tr>
        )})
    }
        { !(TopList?.length > 0) &&
        <tr className="h-full">
        <td colSpan={3} className="text-center py-10 text-gray-500">등록된 게시글이 없습니다.</td>
        </tr>
    }
    </tbody>
     </table>
     </div>);

}

export default NoticeComponent;