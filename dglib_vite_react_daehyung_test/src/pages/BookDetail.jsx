import BasicLayout from "../layouts/BasicLayout";
import SearchBookDetail from "../components/SearchBookDetail";
const BookDetail = () => {
    return (
        <BasicLayout>
            <h1>도서정보</h1>
            <SearchBookDetail />
        </BasicLayout>
    )
}

export default BookDetail;  