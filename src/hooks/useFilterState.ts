import { useState, useMemo } from 'react';
import { FridgeItem } from './useFridgeData';

export const useFilterState = (fridgeItems: FridgeItem[]) => {
  const [activeItemCategory, setActiveItemCategory] = useState('전체');
  const [isListEditMode, setIsListEditMode] = useState(false);

  // 필터링 + 정렬 (소비기한 임박순)
  const filteredItems = useMemo(() => {
    const filtered = fridgeItems.filter(
      item =>
        activeItemCategory === '전체' ||
        item.itemCategory === activeItemCategory,
    );

    // 소비기한 기준으로 정렬 (임박한 것부터)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);

      // 날짜가 빠른 것(임박한 것)이 위로 오도록 오름차순 정렬
      return dateA.getTime() - dateB.getTime();
    });
  }, [fridgeItems, activeItemCategory]);

  const toggleEditMode = () => {
    setIsListEditMode(!isListEditMode);
  };

  return {
    activeItemCategory,
    setActiveItemCategory,
    isListEditMode,
    setIsListEditMode,
    toggleEditMode,
    filteredItems,
  };
};
