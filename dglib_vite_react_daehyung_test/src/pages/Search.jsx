import BasicLayout from "../layouts/BasicLayout";
import SearchComponent from "../components/SearchComponent";

const Search = () => {
    return (
        <BasicLayout>
            <h1>알라딘 API 도서 검색</h1>
            <SearchComponent />
        </BasicLayout>
    );
}

export default Search;