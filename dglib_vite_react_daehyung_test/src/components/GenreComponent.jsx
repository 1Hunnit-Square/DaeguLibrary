import { useQuery } from "@tanstack/react-query";
import { getBookreco } from "../api/bookApi";
import { useParams } from "react-router-dom";


const GenreComponent = () => {
    const { genre } = useParams();
    const defaultGenre = "literature"
    console.log(genre)
    const { isLoading, isFetching, data, isError } = useQuery({
        queryKey: ['bookreco', genre ?? defaultGenre],
        queryFn: () => getBookreco(genre ?? defaultGenre),
        staleTime:Infinity,
        refetchOnWindowFocus: false
    })


    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>데이터 로딩 중 오류가 발생했습니다.</div>;
    if (!data) {return <div>데이터를 받아오지 못했습니다.</div>;}
    let books;
    try {
        books = JSON.parse(data.result).response.docs;
    } catch (e) {
        return <div>데이터 로딩 중 오류가 발생했습니다.</div>;
    }
    console.log(books)

    return (
        <div className="grid grid-cols-5 p-8">


            {books.map((bookData) => (
                <div className='p-2 flex flex-col items-center' key={bookData.doc.isbn13}>
                    <div className="w-64 h-64">
                        <img className="w-full h-full object-contain" src={bookData.doc.bookImageURL} />
                    </div>
                    <h3 className="text-sm font-semibold text-center max-w-40 pt-2 pb-2 w-full overflow-hidden whitespace-nowrap text-ellipsis">{bookData.doc.bookname}</h3>
                    <p className="text-xs text-gray-600 text-center overflow-hidden max-w-40 whitespace-nowrap text-ellipsis" >{bookData.doc.authors}</p>


                </div>
             ))}



        </div>
    )
}

export default GenreComponent;