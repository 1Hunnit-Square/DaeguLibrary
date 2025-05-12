import { useState } from 'react';

export const useSearchInput = (initialValue = '') => {
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const handleChange = (event) => {
        setSearchQuery(event.target.value);
        console.log(event.target.value);
    };
    return { searchQuery, handleChange}; };