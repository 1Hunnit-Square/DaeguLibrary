import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useDateRangeHandler = () => {
    const [searchParams] = useSearchParams();
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate")});

  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  return { dateRange, setDateRange, handleDateChange };
}