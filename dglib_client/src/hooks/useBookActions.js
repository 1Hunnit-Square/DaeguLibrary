import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { memberIdSelector } from '../atoms/loginState';
import { useMoveTo } from './useMoveTo';

export const useBookActions = (mutations, selectedBooks = new Set()) => {
  const mid = useRecoilValue(memberIdSelector);
  const { moveToLogin } = useMoveTo();


  const handleReserveClick = useCallback((book) => {
    if (!mid) {
      moveToLogin("로그인이 필요합니다.");
      return;
    }

    if (book.overdue && !confirm("연체중인 도서입니다. 예약하시겠습니까?")) {
      return;
    }

    mutations.reserve.mutate({
      libraryBookId: book.libraryBookId,
    });
  }, [mid, moveToLogin, mutations.reserve]);


  const handleUnMannedReserveClick = useCallback((book) => {
    if (!mid) {
      moveToLogin("로그인이 필요합니다.");
      return;
    }

    mutations.unmanned.mutate({
      libraryBookId: book.libraryBookId,
    });
  }, [mid, moveToLogin, mutations.unmanned]);


  const handleInterestedClick = useCallback((book) => {
    if (!mid) {
      moveToLogin("로그인이 필요합니다.");
      return;
    }

    mutations.interested.mutate([book.libraryBookId]);
  }, [mid, moveToLogin, mutations.interested]);


  const clickSelectFavorite = useCallback(() => {
    if (!mid) {
      moveToLogin("로그인이 필요합니다.");
      return;
    }

    if (selectedBooks.size === 0) {
      alert("관심도서를 선택해주세요.");
      return;
    }

    mutations.interested.mutate(Array.from(selectedBooks));
  }, [mid, moveToLogin, mutations.interested, selectedBooks]);

  return {
    handleReserveClick,
    handleUnMannedReserveClick,
    handleInterestedClick,
    clickSelectFavorite
  };
};