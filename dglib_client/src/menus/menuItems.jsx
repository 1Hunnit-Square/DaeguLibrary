import { selector } from 'recoil';

const defaultMenuItems = [
    {
      id: 1,
      title: '도서관 소개',
      link: '/about',
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
      link: '/books',
      subMenus: [
        { name: '통합검색', link: '/books/search' },
        { name: '신착도서', link: '/books/new' },
        { name: '추천도서', link: '/books/recommend' },
        { name: '대출베스트도서', link: '/books/popular' }
      ]
    },
    {
      id: 3,
      title: '도서관 이용',
      link: '/usage',
      subMenus: [
        { name: '자료실 이용', link: '/usage/readingroom' },
        { name: '회원가입 안내', link: '/usage/membership' },
        { name: '도서 대출 및 반납', link: '/usage/borrowreturn' }
      ]
    },
    {
      id: 4,
      title: '신청 및 예약',
      link: '/reservation',
      subMenus: [
        { name: '희망도서 신청', link: '/reservation/bookrequest' },
        { name: '프로그램 신청', link: '/reservation/program' },
        { name: '시설 이용 신청', link: '/reservation/facility' }
      ]
    },
    {
      id: 5,
      title: '시민참여',
      link: '/community',
      subMenus: [
        { name: '공지사항', link: '/community/notice' },
        { name: '새소식', link: '/community/news' },
        { name: '문의게시판', link: '/community/inquiry' },
        { name: '도서관갤러리', link: '/community/gallery' },
        { name: '보도자료', link: '/community/press' },
        { name: '도서기증', link: '/community/donation' }
      ]
    },
    {
      id: 6,
      title: '내서재',
      link: '/mylib',
      subMenus: [
        { name: '대출 현황', link: '/mylib/borrowstatus' },
        { name: '도서 예약', link: '/mylib/reservation' },
        { name: '관심 도서', link: '/mylib/wishlist' },
        { name: '희망 도서', link: '/mylib/request' },
        { name: '프로그램 신청 내역', link: '/mylib/program' },
        { name: '이용 신청 안내', link: '/mylib/usage-guide' },
        { name: '맞춤 정보', link: '/mylib/personalized' }
      ]
    }
  ];

  const adminMenuItem = {
    id: 6,
    title: '관리자',
    link: '/admin',
    subMenus: [
      { name: '관리자서브', link: '/admin/sub' }
    ]
  };

  export const menuItemsSelector = selector({
    key: 'menuItemsSelector',
    get: ({get}) => {
      const isLoggedIn = true; //나중에 바꾸셈
      const userRole = 'user' // 나중에 바꾸셈
      const menuItems = [...defaultMenuItems];
      if (isLoggedIn && userRole === 'admin') {
        menuItems[5] = adminMenuItem; 
      }
      
      return menuItems;
    }
  });