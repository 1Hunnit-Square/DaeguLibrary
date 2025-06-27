import { selector } from 'recoil';
import { memberRoleSelector } from '../atoms/loginState';

const getDateParams = () => {
  const today = new Date();
  const aMonthAgo = new Date(today);
  aMonthAgo.setDate(today.getDate() - 30);


  const endDateStr = today.toLocaleDateString('fr-CA');
  const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

  return `startDate=${startDateStr}&endDate=${endDateStr}`;
};
const dateParams = getDateParams();
const currentYear = new Date().getFullYear();



const defaultMenuItems = [
    {
      id: 1,
      title: '도서관 소개',
      link: '/about/greeting',
      subMenus: [
        { name: '인사말', link: '/about/greeting' },
        { name: '조직 및 현황', link: '/about/organization' },
        { name: '도서관 정책', link: '/about/policy' },
        { name: '오시는 길', link: '/about/location' }
      ]
    },
    {
      id: 2,
      title: '도서정보',
      link: '/books/search?tab=info&page=1',
      subMenus: [
        { name: '통합검색', link: '/books/search?tab=info&page=1' },
        { name: '신착도서', link: `/books/new?page=1&${dateParams}` },
        { name: '추천도서', link: '/books/recommend?genre=literature&page=1' },
        { name: '대출베스트도서', link: '/books/top?check=오늘' },
        { name: 'EBOOK', link: '/books/ebook' },
      ]
    },
    {
      id: 3,
      title: '도서관 이용',
      link: '/usage/readingroom',
      subMenus: [
        { name: '자료실 이용', link: '/usage/readingroom' },
        { name: '회원가입 안내', link: '/usage/membership' },
        { name: '도서 대출 및 반납', link: '/usage/borrowreturn' },
        { name: '이달의 행사 일정', link: '/usage/calendar' }
      ]
    },
    {
      id: 4,
      title: '신청 및 예약',
      link: '/reservation/bookrequest',
      subMenus: [
        { name: '희망도서 신청', link: '/reservation/bookrequest' },
        { name: '프로그램 신청', link: '/reservation/program' },
        { name: '시설 이용 신청', link: '/reservation/facility' }
      ]
    },
    {
      id: 5,
      title: '시민참여',
      link: '/community/notice',
      subMenus: [
        { name: '공지사항', link: '/community/notice' },
        { name: '새소식', link: '/community/event' },
        { name: '문의게시판', link: '/community/qna' },
        { name: '도서관갤러리', link: '/community/gallery' },
        { name: '보도자료', link: '/community/news' },
        { name: '도서기증', link: '/community/donation' }
      ]
    },
    {
      id: 6,
      title: '내서재',
      link: '/mylibrary/borrowstatus',
      subMenus: [
        { name: '대출관리', link: '/mylibrary/borrowstatus' },
        { name: '도서예약', link: '/mylibrary/bookreservation' },
        { name: '관심도서', link: '/mylibrary/interested?page=1&option=전체' },
        { name: '희망도서', link: `/mylibrary/request?year=${currentYear}` },
        { name: '내 EBOOK', link: '/mylibrary/myebook?page=1&option=전체' },
        { name: '프로그램 신청 내역', link: '/mylibrary/useprogram' },
        { name: '시설이용 신청 내역', link: '/mylibrary/usedfacility' },
        { name: '맞춤정보', link: '/mylibrary/personalized' }
      ]
    }
  ];



  const getAdminMenuItem = (items, role) => {
    if(role == "ADMIN"){
    return [ ...items, {

      id: 7,
      title: '관리자',
      link: `/admin/bookmanagement?tab=booklist&option=도서명&page=1&${dateParams}`,
      subMenus: [
        { name: '도서관리', link: `/admin/bookmanagement?tab=booklist&option=도서명&page=1&${dateParams}` },
        { name: "EBOOK 관리", link: `/admin/ebookmanagement?tab=ebooklist&page=1&option=도서명&${dateParams}` },
        { name: '대출예약관리', link: '/admin/borrow?tab=borrow&page=1' },
        { name: '회원관리', link: '/admin/membermanagement?page=1' },
       { name: '이달의 행사 관리', link: '/admin/calendarmanagement' },
        { name: '프로그램·시설 관리', link: '/admin/progmanagement' },
        { name: "배너관리", link: "/admin/bannermanagement" },
        { name: "게시판관리", link: "/admin/boardmanagement" },
        { name: "메신저관리", link: "/admin/messengermanagement" },
        { name: "통계관리", link: `/admin/statsmanagement?${dateParams}` },

      ]
    }];

  }else if(role == "MANAGER") {
      return [ ...items, {

        id: 7,
        title: '관리자',
        link: `/admin/bookmanagement?tab=booklist&option=도서명&page=1&${dateParams}`,
        subMenus: [
          { name: '도서관리', link: `/admin/bookmanagement?tab=booklist&option=도서명&page=1&${dateParams}` },
          { name: "EBOOK 관리", link: `/admin/ebookmanagement?tab=ebooklist&page=1&option=도서명&${dateParams}` },
          { name: '대출예약관리', link: '/admin/borrow?tab=borrow&page=1' },

        ]
      }];

  }else {
      return items;
    }
};

  export const menuItemsSelector = selector({
    key: 'menuItemsSelector',
    get: ({get}) => {
      const role = get(memberRoleSelector);
      const menuItems = getAdminMenuItem(defaultMenuItems, role);
      return menuItems;
    }
  });