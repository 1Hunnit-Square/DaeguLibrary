import { useCallback } from "react";

export const useSelectHandler = (searchParams, setSearchParams) => {
  const handleSelectChange = useCallback((field, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(field, value);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return { handleSelectChange };
};