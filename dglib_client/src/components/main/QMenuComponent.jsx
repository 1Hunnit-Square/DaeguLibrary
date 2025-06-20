import { Link } from 'react-router-dom';

const QMenuComponent = () => {
    const menuItems = [
        { name: '추천도서', link: '/books/recommend', icon: '📚' },
        { name: '대출조회', link: '/mylibrary/borrowstatus', icon: '🔍' },
        { name: '도서예약', link: '/mylibrary/bookreservation', icon: '📅' },
        { name: '시설이용신청', link: '/reservation/facility', icon: '🏢' },
        { name: '프로그램신청', link: '/reservation/program', icon: '📝' },
        { name: '모바일회원증', link: '/mylib/card', icon: '📱' }
    ];

    return (
        <div className="my-6 mx-auto">
            <ul className="flex flex-wrap justify-center gap-12">
                {menuItems.map((item, index) => (
                    <li key={index} className="text-center">
                        <Link 
                            to={item.link} 
                            className="flex flex-col justify-center p-4 w-28 h-16 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300"
                        >
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <span className="font-medium text-xs">{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default QMenuComponent;