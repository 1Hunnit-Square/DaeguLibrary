import { useQuery } from "@tanstack/react-query";
import { getBookreco } from "../../api/bookPythonApi";
import { useNavigate } from "react-router-dom";
import Loading from "../../routers/Loading";


const GenreComponent = ({genre}) => {
    console.log(genre)
    const navigate = useNavigate();
    const { isLoading, isFetching, data, isError } = useQuery({
        queryKey: ['bookreco', genre],
        queryFn: () => getBookreco(genre),
        staleTime:Infinity,
        refetchOnWindowFocus: false
    })

    const handleBookClick = (isbn) => {
        navigate(`/books/detail/${isbn}?from=reco`);
    };


    if (isLoading) return <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
    if (isError) return <div>데이터 로딩 중 오류가 발생했습니다.</div>;
    if (!data) {return <div>데이터를 받아오지 못했습니다.</div>;}
    let books;
    try {
        const parsedData = JSON.parse(data.result);
        books = parsedData.content;
    } catch (e) {
        return <div>데이터 로딩 중 오류가 발생했습니다.</div>;
    }
    console.log(books)

    return (
        <div className="p-4">
            <div className={`flex gap-4 ${
                'sm:flex-wrap sm:justify-between overflow-x-auto sm:overflow-x-visible scrollbar-hidden sm:scrollbar-auto scroll-smooth touch-pan-x'
            }`}>
                {books.map((bookData) => (
                    <div className='flex flex-col items-center group hover:scale-105 transition-transform duration-200 w-32 sm:w-36 md:w-40 flex-shrink-0 sm:flex-shrink' 
                    key={bookData.isbn13}
                    onClick={() => handleBookClick(bookData.isbn13)}>
                        <div className="w-full aspect-[3/4]">
                            <img 
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200" 
                                src={bookData.bookImageURL} 
                                alt={bookData.bookname}
                            />
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-center pt-2 pb-1 w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {bookData.bookname}
                        </h3>
                        <p className="text-xs text-gray-600 text-center w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {bookData.authors}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GenreComponent;