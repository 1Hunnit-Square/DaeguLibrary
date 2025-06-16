import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatActionComponent = ({chat}) => {
    const navigate = useNavigate();
   

    
    
    const getServiceLink = (chat) => {
        

    
        
        if (chat.service === "search_author" && chat.to) {
            
            let authorName = chat.to;
            if (authorName.includes(',')) {
                authorName = authorName.split(',')[0].trim();
            }
            authorName = authorName.replace(/\s*\([^)]+\)/g, '').trim();
            return {
                text: `📚 "${authorName}" 작가의 다른 책 보기`,
                path: `/books/search?query=${encodeURIComponent(authorName)}&option=저자&isSearched=true&tab=info&page=1`,
                color: 'blue'
            };
        } else if (chat.service === "search_book_title" && chat.to) {
           
            return {
                text: `📖 도서 상세정보`,
                path: `/books/detail/${encodeURIComponent(chat.to)}`,
                color: 'green'
            };
        } else if (chat.service === "not_search_book_title") {
            return {
                text: `📖 도서 검색하기`,
                path: `/books/search?tab=info&page=1`,
                color: 'blue'
            }
        } else if (chat.service === "not_search_author") {
            return {
                text: `📚 작가 검색하기`,
                path: '/books/search?tab=info&page=1&option=%EC%A0%80%EC%9E%90',
                color: 'blue'
            }
        } else if (chat.service === "member_borrow") {
            return {
                text: `📚 대출 현황 보기`,
                path: '/mylibrary/borrowstatus',
                color: 'blue'
            }
        } else if (chat.service === "plese_leave") {
            return {
                text: `☠️ 이 도서관을 떠나거라`,
                path: '/logout',
                color: 'red'
            }
        } else if (chat.service === "login") {
            return {
                text: `🔐 로그인하기`,
                path: '/login',
                color: 'blue'
            }
        }
        
        return null;
    };

   

    
    const serviceLink = getServiceLink(chat);

    if (!serviceLink) {
        return null;
    }

    const handleClick = () => {
        navigate(serviceLink.path);
    };

    return (
        <div className="mt-4 mb-4  border-gray-200">
            <a 
                onClick={handleClick}
                className={`inline-flex items-center px-3 py-2 rounded-md transition-colors text-xs hover:cursor-pointer
                    ${serviceLink.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' : ''}
                    ${serviceLink.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : ''}
                    ${serviceLink.color === 'red' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : ''}
                `}
            >
                {serviceLink.text}
            </a>
        </div>
    );
};

export default ChatActionComponent;