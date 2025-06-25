import { Link } from 'react-router-dom';

const QMenuComponent = () => {
    const menuItems = [
        { name: '추천도서', link: '/books/recommend', icon: '/recommend_book_icon1.png' },
        { name: '대출조회', link: '/mylibrary/borrowstatus', icon: '/search_book_icon2.png' },
        { name: '도서예약', link: '/mylibrary/bookreservation', icon: '/reservation_book_icon3.png' },
        { name: '시설이용신청', link: '/reservation/facility', icon: '/facility_icon4.png' },
        { name: '프로그램신청', link: '/reservation/program', icon: '/program_icon5.png' },
        { name: '모바일회원증', link: '/mylib/card', icon: '/mobilecard_icon6.png' }
    ];

    return (
        <div className="my-10 mx-auto">
            <ul className="flex flex-wrap justify-center gap-15">
                {menuItems.map((item, index) => (
                    <li key={index} className="text-center">
                        <Link 
                            to={item.link} 
                            className="flex flex-col justify-center items-center p-4 w-28 h-20 rounded-lg border border-gray-100 hover:border-green-700 hover:border-2 shadow-md"
                        >
                            <img src={item.icon} alt={item.name} className="w-12 h-12 mb-1" />
                            <span className="font-medium text-xs">{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QMenuComponent;
