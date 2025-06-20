import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import root from './routers/root';
import { ToastContainer, toast } from 'react-toastify';
import './App.css'
import RecoilLoginState from './atoms/loginState';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Query error:", error);
      toast.error(`데이터 불러오기 실패: ${error.response?.data?.message ?? "서버와 연결이 실패했습니다"}`, {
      position: 'top-center',
    });
    },
  }),
});

function App() {
  const [loginState, setLoginState] = useRecoilState(RecoilLoginState);
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        setLoginState({});

      }
    };

    window.addEventListener('storage', syncLogout);

    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }
  , []);

  return (
    <QueryClientProvider client={queryClient}>
     <ToastContainer />
    <RouterProvider router = {root}></RouterProvider>
    </QueryClientProvider>
  );
}

export default App
