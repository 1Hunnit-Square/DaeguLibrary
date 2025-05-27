import { useState, useMemo, useCallback } from 'react';

export const useItemSelection = (items = [], idField = 'id') => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedItems.size === items.length;
  }, [items, selectedItems]);


  const handleSelectItem = useCallback((e, itemId) => {
    const isSelected = e.target.checked;

    setSelectedItems(prev => {
      const newSelectedItems = new Set(prev);

      if (isSelected) {
        newSelectedItems.add(itemId);
      } else {
        newSelectedItems.delete(itemId);
      }

      return newSelectedItems;
    });
  }, []);

  const handleSelectAll = useCallback((e) => {
    const isSelected = e.target.checked;

    if (isSelected) {
      const newSelectedItems = new Set();
      items.forEach(item => {
        if (item && item[idField] !== undefined) {
          newSelectedItems.add(item[idField]);
        }
      });
      setSelectedItems(newSelectedItems);
    } else {
      setSelectedItems(new Set());
    }
  }, [items, idField]);

  const resetSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    selectedItems,
    isAllSelected,
    handleSelectItem,
    handleSelectAll,
    resetSelection
  };
};