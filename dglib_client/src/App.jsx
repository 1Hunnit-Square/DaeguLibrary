import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import root from './routers/root';
import { ToastContainer, toast } from 'react-toastify';
import './App.css'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Query error:", error);
      toast.error(`데이터 불러오기 실패: ${error.response?.data?.message}`, {
      position: 'top-center',
    });
    },
  }),
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
     <ToastContainer />
    <RouterProvider router = {root}></RouterProvider>
    </QueryClientProvider>
  );
}

export default App
