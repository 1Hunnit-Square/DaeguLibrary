import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useBookMutation = (
  mutationFn,
  {
    successMessage = '완료되었습니다.',
    queryKeyToInvalidate = ['librarybooklist'],
    onReset = () => {},
    failRefrash = true
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(queryKeyToInvalidate);
      alert(successMessage);
      onReset();
    },
    onError: (error) => {
      console.log("오류:", error);
      alert(`${error.response?.data?.message || ''}`);
      if (failRefrash) {
        window.location.reload();
      }

    }
  });
};