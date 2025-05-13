import Layout from "../layouts";
import SubHeader from "../layouts/SubHeader";
import DynamicTab from "../menus/DynamicTab";
import NomalSearchBookComponent from "../components/books/NomalSearchBookComponent";

const BooksSearch = () => {


  const searchOption = ["전체", "제목", "저자", "출판사"];
  const myTabs = [
    { id: 'info', label: '일반검색', content:
    <div>
      <NomalSearchBookComponent />
      </div> },
    { id: 'settings', label: '상세검색', content: <div>상세검색</div> }
  ];
  return (
    <Layout>
        <SubHeader subTitle="통합검색" mainTitle="도서정보" />
        <DynamicTab tabsConfig={myTabs} />
    </Layout>
  );
}

export default BooksSearch;




