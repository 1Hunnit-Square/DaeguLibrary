import { color } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatActionComponent = ({chat}) => {
    const navigate = useNavigate();
      const currentDate = new Date().toDateString();
      const getDateParams = useMemo(() => {
            const today = new Date();
            const aMonthAgo = new Date(today);
            aMonthAgo.setDate(today.getDate() - 30);
    
            const endDateStr = today.toLocaleDateString('fr-CA');
            const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');
    
            return `startDate=${startDateStr}&endDate=${endDateStr}`;
        }, [currentDate]);

    const getServiceLink = (chat) => {
   
        if (chat.service === "search_author" && chat.to) {
            
            let authorName = chat.to;
            if (authorName.includes(',')) {
                authorName = authorName.split(',')[0].trim();
            }
            authorName = authorName.replace(/\s*\([^)]+\)/g, '').trim();
            return [{
                text: `📚 "${authorName}" 작가의 다른 책 보기`,
                path: `/books/search?query=${encodeURIComponent(authorName)}&option=저자&isSearched=true&tab=info&page=1`,
                color: 'blue'
            }];
        } else if (chat.service === "search_book_title" && chat.to) {
           
            return [{
                text: `📖 도서 상세정보`,
                path: `/books/detail/${encodeURIComponent(chat.to)}`,
                color: 'green'
            }];
        } else if (chat.service === "not_search_book_title") {
            return [{
                text: `📖 도서 검색하기`,
                path: `/books/search?tab=info&page=1`,
                color: 'blue'
            }, {
                text: '🔖 희망도서 신청',
                path: '/reservation/bookrequest',
                color: 'green'
            }];
        } else if (chat.service === "not_search_author") {
            return [{
                text: `🖋️ 작가 검색하기`,
                path: '/books/search?tab=info&page=1&option=저자',
                color: 'blue'
            }, {
                text: '🔖 희망도서 신청',
                path: '/reservation/bookrequest',
                color: 'green'
            }];
        } else if (chat.service === "member_borrow") {
            return [{
                text: `📚 대출 현황 보기`,
                path: '/mylibrary/borrowstatus',
                color: 'blue'
            }];
        } else if (chat.service === "plese_leave") {
            return [{
                text: `☠️ 이 도서관을 떠나거라`,
                path: '/logout',
                color: 'red'
            }];
        } else if (chat.service === "login") {
            return [{
                text: `🔐 로그인하기`,
                path: '/login',
                color: 'blue'
            }];
        } else if (chat.service === "borrow_best") {
            return [{
                text: `📖 도서 상세정보`,
                path: `/books/detail/${encodeURIComponent(chat.to)}`,
                color: 'green'
            },{
                text: `📚 대출 베스트 도서 보기`,
                path: '/books/top?check=오늘',
                color: 'blue',
            }];
        } else if (chat.service === "new_book") {
            return [{
                text: `📖 도서 상세정보`,
                path: `/books/detail/${encodeURIComponent(chat.to)}`,
                color: 'green'
            },{
                text: `📚 신착 도서 보기`,
                path: `/books/new?page=1&${getDateParams}`,
                color: 'blue',
            }];
        } else if (chat.service === "holiday") {
            return [{
                text: `📅 휴관일 확인하기`,
                path: '/usage/calendar',
                color: 'red'
            }];
        } else if (chat.service === "programm") {
            return [{
                text: `📅 프로그램 확인 및 신청`,
                path: '/reservation/program',
                color: 'blue'
            }]
        } else if (chat.service === "location") {
            return [{
                text: `🏛️ 시설이용 신청`,
                path: '/reservation/facility',
                color: 'green'
            }]
        } else if (chat.service === "book_reservation") {
            return [{
                text: `📚 도서 예약 현황 보기`,
                path: '/mylibrary/bookreservation',
                color: 'blue'
            }]
        }
        
        return null;
    };

   

    
    const serviceLink = getServiceLink(chat);

    if (!serviceLink) {
        return null;
    }

    const handleClick = (path) => {
        navigate(path);
    };

    return (
        <div className="border-gray-200">
            {serviceLink.map((lk, index) => (
                <a 
                    key={index}
                    onClick={() => handleClick(lk.path)}
                    className={`inline-flex items-center px-3 py-2 mr-3 rounded-md transition-colors text-xs hover:cursor-pointer
                        ${lk.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' : ''}
                        ${lk.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : ''}
                        ${lk.color === 'red' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : ''}
                    `}
                >
                    {lk.text}
                </a>
            ))}
        </div>
    );
};

export default ChatActionComponent;