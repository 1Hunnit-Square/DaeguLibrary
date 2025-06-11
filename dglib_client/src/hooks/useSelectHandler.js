import { useCallback } from "react";

export const useSelectHandler = (searchParams, setSearchParams, isPaging = true) => {
  const handleSelectChange = useCallback((field, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(field, value);
    if (isPaging) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return { handleSelectChange };
};