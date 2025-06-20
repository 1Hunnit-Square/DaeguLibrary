import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useDateRangeHandler = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate")});

  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));

    const newParams = new URLSearchParams(searchParams);
    newParams.set(name, value);
    newParams.set('page', '1'); 
    setSearchParams(newParams);
  }, []);

  return { dateRange, setDateRange, handleDateChange };
}