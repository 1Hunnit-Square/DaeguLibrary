import Loading from "../../routers/Loading";

// tableMap = {
// table : {},
// leftKey: [],
// overKey: [],
// lineKey : [],
// dateKey : [],
// noneData: ""
// }

const TableComponent = ({data, isLoading, handleListClick, tableMap, defaultKey, indexNum = true}) => {

    const dataList = data.content;
    const dataPage = data.pageable?.pageNumber;
    const dataSize = data.pageable?.pageSize;

    const toDate = (key, dateTime) => {
        if(tableMap.dateKey?.includes(key))
        return dateTime.substring(0, 10);
        else
        return dateTime;
    }

return(

<table className = "min-w-full bg-white">
        <thead>
          <tr className = "border-b-2 border-b-[#00893B] border-t-2 border-t-[#00893B]" >
            {indexNum && <th className={`py-3 px-1 text-center whitespace-nowrap uppercase`}>번호</th>}
            { Object.values(tableMap.table).map((value) =>{ 
                return <th className={`py-3 px-3 text-center whitespace-nowrap uppercase`}>{value}</th>
            }) 
            }
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td><Loading /></td>
            </tr>
          ) : dataList.length === 0 ? (
            <tr>
              <td colSpan={Object.keys(tableMap.table).length+ (indexNum ? 1 : 0)} className="py-10 px-6 text-center text-gray-500 text-xl">
              {tableMap.noneData}
              </td>
             </tr>
          ) : (
            dataList.map((item, index) => (
              <tr key={index} className = {`border-b border-[#ddd] hover:bg-gray-100 transition-colors duration-200 cursor-pointer`} onClick={()=> handleListClick(item[defaultKey])}>
                {indexNum && <td className={`py-3 px-1 text-center whitespace-nowrap`}>{dataPage * dataSize  + index +1}</td>}
                {Object.keys(tableMap.table).map((key) => {
                    const left = tableMap.leftKey?.includes(key) ? "text-left" : "text-center";
                    const overflow = tableMap.overKey?.includes(key) ? "min-w-100 max-w-100 truncate" : "";
                    const underline = tableMap.lineKey?.includes(key) ? "hover:underline" : "";
                    return <td className={`py-3 px-3 ${left} ${overflow} ${underline} whitespace-nowrap`}>{toDate(key, item[key])}</td>

                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    )

}

export default TableComponent;