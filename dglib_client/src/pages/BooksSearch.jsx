import Layout from "../layouts";
import SubHeader from "../layouts/SubHeader";
import DynamicTab from "../menus/DynamicTab";
import NomalSearchBookComponent from "../components/books/NomalSearchBookComponent";
import FilterSearchBookComponent from "../components/books/FilterSearchBookComponent";

const BooksSearch = () => {

  const myTabs = [
    { id: 'info', label: '일반검색', content:<NomalSearchBookComponent /> },
    { id: 'settings', label: '상세검색', content: < FilterSearchBookComponent /> }
  ];
  return (
    <Layout>
        <SubHeader subTitle="통합검색" mainTitle="도서정보" />
        <DynamicTab tabsConfig={myTabs} />
    </Layout>
  );
}

export default BooksSearch;




