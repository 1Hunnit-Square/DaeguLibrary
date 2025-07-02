// App.jsx
import { RouterProvider} from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import root from './routers/root';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import RecoilLoginState from './atoms/loginState';
import { useRecoilState, RecoilRoot } from 'recoil';
import { useEffect } from 'react';
import { logoutHelper } from "./util/logoutHelper";
import { set } from 'lodash';

let isTokenExpiredAlertShown = false;



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => {
        if (error.message === "REQUIRE_RELOGIN") return false;
        if (error.response?.status === 403) return false;

        return count < 3;
      },
    },
  },
  queryCache: new QueryCache({

    onError: (error) => {
      if (error.message === "REQUIRE_RELOGIN") {
        if (!isTokenExpiredAlertShown) {
          isTokenExpiredAlertShown = true;
          alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
          logoutHelper();
          setTimeout(() => {
            isTokenExpiredAlertShown = false;
          }, 1000);
        }
        return;
      }
      if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.");
        root.navigate('/');
        
        return;
      }
      console.error('Query error:', error);
      toast.error(`데이터 불러오기 실패: ${error?.response?.data?.message ?? '서버와 연결이 실패했습니다'}`, {
        position: 'top-center',
      });
    },
  }),
});


function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </RecoilRoot>
  );
}


function InnerApp() {
  const [loginState, setLoginState] = useRecoilState(RecoilLoginState);

  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        setLoginState({});
      }
    };

    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={root} />
    </>
  );
}

export default App;
