import { useState, useCallback, useEffect } from "react";

export const useCheckboxFilter = (
  searchParams,
  setSearchParams,
  paramName = "check",
  defaultValue = "전체"
) => {
  const [selectedValue, setSelectedValue] = useState(searchParams.get(paramName) || defaultValue);

  useEffect(() => {
    setSelectedValue(searchParams.get(paramName) || defaultValue);
  }, [searchParams, paramName, defaultValue]);

  const handleValueChange = useCallback((newValue) => {
    if (newValue === selectedValue) {
      return;
    }
    setSelectedValue(newValue);
    const newParams = new URLSearchParams(searchParams);
    newParams.set(paramName, newValue);
    newParams.set("page", "1");
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, selectedValue, paramName]);

  return { selectedValue, setSelectedValue, handleValueChange };
};