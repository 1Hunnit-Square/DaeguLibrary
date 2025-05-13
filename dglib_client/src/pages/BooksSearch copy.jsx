import Layout from "../layouts";
import FilterBookListComponent from "../components/books/FilterBookListComponent";
import SubHeader from "../layouts/SubHeader";
import DynamicTab from "../menus/DynamicTab";
import SearchSelectComponent from "../components/common/SearchSelectComponent";
import CheckBox from "../components/common/CheckBox";
import { useState, useEffect, useCallback, useRef  } from "react";
import { useLocation, useSearchParams, } from "react-router-dom";

const BooksSearch = () => {
  const [ searchParams, setSearchParams ] = useState({
    query: "",
    option: "전체"
  })
  const [ isSearched, setIsSearched ] = useState(false);
  const [ isChecked, setIsChecked ] = useState(false);
  const [results, setResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const prevCheckedStateRef = useRef(false);

  useEffect(() => {
      const handlePopState = () => {
        if (prevCheckedStateRef.current) {
          setIsChecked(true);
          setResults(2);
        }
         if (location.pathname === '/books/search') {
        setSearchParams({
          query: "",
          option: "전체"
        });
        setIsSearched(false);
        setIsChecked(false);
        setResults(0);
        setIsLoading(false);
        prevCheckedStateRef.current = false;
      }



      };


      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, []);

  useEffect(() => {
    setSearchParams({
      query: "",
      option: "전체"
    });
    setIsSearched(false);
    setIsChecked(false);
    setResults(0);
    setIsLoading(false);
  }, [location.pathname]);





  const onSearch = (searchQuery, selectedOption) => {
    setSearchParams({
      query: searchQuery,
      option: selectedOption
    });
    setIsSearched(true);
    setIsLoading(true);
 }

 const onChange = (e) => {
    const newValue = e.target.checked;
    setIsChecked(newValue);
    prevCheckedStateRef.current = newValue;
  }


  const handleSearchResults = useCallback((resultsCount) => {
    setResults(resultsCount);
    if (resultsCount <= 1) {
      setIsChecked(false);
    }
    setIsLoading(false);
  }, []);

  const handleIsCheckedChange = (newIsChecked) => {
    setIsChecked(newIsChecked);
};
  const searchOption = ["전체", "제목", "저자", "출판사"];
  const myTabs = [
    { id: 'info', label: '일반검색', content:
    <div>
      <SearchSelectComponent selectClassName="mr-5" dropdownClassName="w-32" onSearch={onSearch} options={searchOption} inputClassName="w-100" buttonClassName="right-[calc(20%-40px)]" />
      {!isLoading && results > 1 && isSearched && <CheckBox label="결과 내 재검색" checkboxClassName="mt-5 ml-2" checked={isChecked} onChange={onChange}/>}

      </div> },
    { id: 'settings', label: '상세검색', content: <div>상세검색</div> }
  ];
  return (
    <Layout>
        <SubHeader subTitle="통합검색" mainTitle="도서정보" />
        <DynamicTab tabsConfig={myTabs} />
        <FilterBookListComponent  searchParams={searchParams} isSearched={isSearched} isChecked={isChecked} onSearchResults={handleSearchResults} onIsCheckedChange={handleIsCheckedChange} />
    </Layout>
  );
}

export default BooksSearch;




