//게시판에 보이는 글번호

const useListNumber = (totalCount, currentPage, pageSize = 10) => {
    return (index) => {
        return ((currentPage - 1) * pageSize + index + 1);
    };
};

export default useListNumber;