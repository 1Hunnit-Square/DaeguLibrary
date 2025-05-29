import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * 검색 파라미터를 관리하는 커스텀 훅
 * @param {Object} options - 훅 옵션
 * @param {string} options.tab - 탭 이름 (예: 'borrowlist', 'booklist', 'reservation')
 * @param {Object} options.dateRange - 날짜 범위 객체 ({startDate, endDate})
 * @param {string} [options.selectedCheck] - 선택된 필터 (예: '전체', '일반', '무인')
 * @param {boolean} [options.selectedState] - 상태 필터 (예: true - '체크', false - 체크해제)
 * @param {string} [options.stateValue] - 선택된 상태의 값 (기본값: 'RESERVED')
 * @param {function} [options.onPageReset] - 검색 이후 실행할 콜백 함수
 * @param {Object} [options.additionalParams] - 추가적으로 설정할 파라미터 객체
 * @returns {function} handleSearch 함수
 */
export const useSearchHandler = ({
  tab,
  dateRange,
  selectedCheck,
  selectedState,
  stateValue = 'RESERVED',
  onPageReset,
  additionalParams = {}
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = useCallback((searchQuery, selectedOption) => {
    const newParams = new URLSearchParams();


    if (searchQuery) newParams.set("query", searchQuery);
    if (selectedOption) newParams.set("option", selectedOption);
    if(tab) newParams.set("tab", tab);
    newParams.set("page", "1");


    if (dateRange) {
      if (dateRange.startDate) newParams.set("startDate", dateRange.startDate);
      if (dateRange.endDate) newParams.set("endDate", dateRange.endDate);
    }


    if (selectedCheck) {
      newParams.set("check", selectedCheck);
    }


    if (selectedState !== undefined) {
      if (selectedState) {
        newParams.set("state", stateValue);
      }
    }


    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      }
    });


    if (onPageReset) {
      onPageReset();
    }

    setSearchParams(newParams);
  }, [tab, dateRange, selectedCheck, selectedState, stateValue, additionalParams, onPageReset, setSearchParams]);

  return { handleSearch };
};