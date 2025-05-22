import Layout from "../layouts/Layout";
import SubHeader from "../layouts/SubHeader";
import Button from "../components/common/Button";


const FindIdPage = () => {


    return(
        <Layout sideOn={false}>
            <SubHeader subTitle="아이디 찾기" mainTitle="기타" />
            <div className = "grid grid-cols-3 justify-center items-center my-10 w-60 mx-auto gap-1">
            <div className = "col-span-3 font-bold my-10 text-center">아이디 찾기</div>
            
                <label className="col-span-1">이름</label>
                <input className = "col-span-2 border rounded w-30" />
                
                <label className="col-span-1">생년월일</label>
                <input type="date" className = "col-span-2 border rounded w-30" />
                 </div>
                 <div className="flex justify-center">
                <Button>아이디 찾기</Button></div>
                
            
           
        </Layout>
    )

}

export default FindIdPage;