import { selector } from 'recoil';

const getDateParams = () => {
  const today = new Date();
  const aMonthAgo = new Date(today);
  aMonthAgo.setDate(today.getDate() - 30);

  const endDateStr = today.toLocaleDateString('fr-CA');
  const startDateStr = aMonthAgo.toLocaleDateString('fr-CA');

  return `startDate=${startDateStr}&endDate=${endDateStr}`;
};
const dateParams = getDateParams();



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
        { name: '추천도서', link: '/books/recommend' },
        { name: '대출베스트도서', link: '/books/top' }
      ]
    },
    {
      id: 3,
      title: '도서관 이용',
      link: '/usage/readingroom',
      subMenus: [
        { name: '자료실 이용', link: '/usage/readingroom' },
        { name: '회원가입 안내', link: '/usage/membership' },
        { name: '도서 대출 및 반납', link: '/usage/borrowreturn' }
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
        { name: '새소식', link: '/community/news' },
        { name: '문의게시판', link: '/community/qna' },
        { name: '도서관갤러리', link: '/community/gallery' },
        { name: '보도자료', link: '/community/press' },
        { name: '도서기증', link: '/community/donation' }
      ]
    },
    {
      id: 6,
      title: '내서재',
      link: '/mylibrary/borrowstatus',
      subMenus: [
        { name: '대출현황', link: '/mylibrary/borrowstatus' },
        { name: '도서예약', link: '/mylibrary/bookreservation' },
        { name: '관심도서', link: '/mylibrary/interested' },
        { name: '희망도서', link: '/mylibrary/request' },
        { name: '프로그램 신청 내역', link: '/mylibrary/useprogram' },
        { name: '이용 신청 내역', link: '/mylibrary/usedfacility' },
        { name: '맞춤정보', link: '/mylibrary/personalized' }
      ]
    }
  ];



  const getAdminMenuItem = () => {


  return {
    id: 6,
    title: '관리자',
    link: `/admin/bookmanagement?tab=booklist&page=1&${dateParams}`,
    subMenus: [
      { name: '도서관리', link: `/admin/bookmanagement?tab=booklist&page=1&${dateParams}` },
      { name: '대출예약관리', link: '/admin/borrow?tab=borrow&page=1' },
    ]
  };
};

  export const menuItemsSelector = selector({
    key: 'menuItemsSelector',
    get: ({get}) => {
      const isLoggedIn = true; //나중에 바꾸셈
      const userRole = 'user' // 나중에 바꾸셈
      const menuItems = [...defaultMenuItems];
      if (isLoggedIn && userRole === 'admin') {
        menuItems[5] = getAdminMenuItem();
      }

      return menuItems;
    }
  });